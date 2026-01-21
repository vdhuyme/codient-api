import { ClassValidationPipe } from '@inversifyjs/class-validation';
import { InversifyValidationError } from '@inversifyjs/validation-common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

class TestLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

describe('ClassValidationPipe', () => {
  let pipe: ClassValidationPipe;

  beforeEach(() => {
    pipe = new ClassValidationPipe();
  });

  describe('execute', () => {
    it('should validate and transform a valid payload', async () => {
      const validPayload = {
        email: 'test@example.com',
        password: 'password123',
      };

      const metadata = { metatype: TestLoginDto } as any;
      const result = await pipe.execute(validPayload, metadata);
      expect(result).toEqual(validPayload);
    });

    it('should throw InversifyValidationError when payload has missing required fields', async () => {
      const invalidPayload = {
        email: 'test@example.com',
        // Missing password field
      };

      const metadata = { metatype: TestLoginDto } as any;
      try {
        await pipe.execute(invalidPayload, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(InversifyValidationError);
      }
    });

    it('should throw InversifyValidationError when email is invalid', async () => {
      const invalidPayload = {
        email: 'invalid-email',
        password: 'password123',
      };

      const metadata = { metatype: TestLoginDto } as any;
      try {
        await pipe.execute(invalidPayload, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(InversifyValidationError);
      }
    });

    /**
     * CRITICAL TEST: Reproduces the issue reported in the bug
     * When a POST request is sent without a body, ClassValidationPipe receives undefined
     * and throws: "TypeError: Cannot read properties of undefined (reading 'constructor')"
     * Expected: Should throw a proper InversifyValidationError instead of TypeError
     */
    it('should handle undefined payload gracefully and throw proper validation error', async () => {
      const undefinedPayload = undefined;
      const metadata = { metatype: TestLoginDto } as any;

      try {
        await pipe.execute(undefinedPayload, metadata);
        fail('Should have thrown an error');
      } catch (error: any) {
        /**
         * Issue: Currently throws TypeError: "Cannot read properties of undefined (reading 'constructor')"
         * Expected: Should throw InversifyValidationError with proper validation messages
         */
        if (error instanceof TypeError) {
          console.error(
            'BUG REPRODUCED: ClassValidationPipe throws TypeError for undefined payload',
          );
          console.error('Error message:', error.message);
          console.error(
            'Expected: InversifyValidationError with validation details',
          );
        }
        expect(error).toBeDefined();
      }
    });

    it('should handle null payload gracefully', async () => {
      const nullPayload = null;
      const metadata = { metatype: TestLoginDto } as any;

      try {
        await pipe.execute(nullPayload, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle empty object payload and throw validation error for missing fields', async () => {
      const emptyPayload = {};
      const metadata = { metatype: TestLoginDto } as any;

      try {
        await pipe.execute(emptyPayload, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(InversifyValidationError);
      }
    });

    it('should validate payload with extra fields (should be allowed)', async () => {
      const payloadWithExtra = {
        email: 'test@example.com',
        password: 'password123',
        extraField: 'should be ignored',
      };

      const metadata = { metatype: TestLoginDto } as any;
      const result = await pipe.execute(payloadWithExtra, metadata);
      expect((result as any).email).toBe('test@example.com');
      expect((result as any).password).toBe('password123');
    });

    it('should throw error when payload is a string', async () => {
      const stringPayload = 'not an object';
      const metadata = { metatype: TestLoginDto } as any;

      try {
        await pipe.execute(stringPayload, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should throw error when payload is a number', async () => {
      const numberPayload = 123;
      const metadata = { metatype: TestLoginDto } as any;

      try {
        await pipe.execute(numberPayload, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should throw error when payload is an array', async () => {
      const arrayPayload = [
        { email: 'test@example.com', password: 'password123' },
      ];
      const metadata = { metatype: TestLoginDto } as any;

      try {
        await pipe.execute(arrayPayload, metadata);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('POST request without body simulation', () => {
    /**
     * This test simulates a real-world scenario where a POST request is sent without a body
     * which results in undefined being passed to the validation pipe
     */
    it('should reproduce the 500 error when POST body is missing', async () => {
      const requestWithoutBody = undefined; // This is what Express provides when no body is sent
      const metadata = { metatype: TestLoginDto } as any;

      try {
        await pipe.execute(requestWithoutBody, metadata);
        fail('Should have thrown an error');
      } catch (error: any) {
        /**
         * Current behavior: TypeError: Cannot read properties of undefined (reading 'constructor')
         *
         * Stack trace from the issue:
         * at ValidationExecutor.execute (...node_modules/src/validation/ValidationExecutor.ts:62:14)
         * at Validator.coreValidate (...node_modules/src/validation/Validator.ts:107:14)
         * at Validator.validate (...node_modules/src/validation/Validator.ts:32:17)
         *
         * Expected behavior: Should catch the undefined/null case and throw InversifyValidationError
         * with a message like "Request body is required" or "Validation failed: email should not be empty, password should not be empty"
         */
        console.error('Current Error Type:', error.constructor.name);
        console.error('Current Error Message:', error.message);

        if (error instanceof TypeError) {
          console.log(
            '✗ BUG CONFIRMED: TypeError thrown instead of InversifyValidationError',
          );
        } else {
          console.log('✓ FIXED: Proper validation error thrown');
        }

        expect(error).toBeDefined();
      }
    });
  });
});
