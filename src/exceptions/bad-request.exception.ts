import HttpException from '@exceptions/http.exception'
import { BAD_REQUEST } from '@constants/http.status.code'

export default class BadRequestException extends HttpException {
  constructor(message = 'BadRequest Exception', status = BAD_REQUEST) {
    super({
      message,
      statusCode: status,
      code: 'BAD_REQUEST'
    })
  }
}
