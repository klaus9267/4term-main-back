import { ApiErrorResponse } from '../interface/interface';

export const SwaggerApiResponse: any = {
  success: (description: string, msg: string, response?: any) => {
    const example = {
      success: true,
      msg,
      response,
    };

    return {
      description,
      schema: {
        example,
      },
    };
  },

  exception: (responses: ApiErrorResponse[]) => {
    const examples = {};

    responses.forEach(({ name, example }) => {
      example.success = false;
      examples[name] = { value: example };
    });

    return {
      content: { 'application-json': { examples } },
    };
  },
};
