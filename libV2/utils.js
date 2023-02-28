const sdk = require('postman-collection'),
  _ = require('lodash'),
  generatePmResponseObject = (response) => {
    const requestItem = generateRequestItemObject({ // eslint-disable-line no-use-before-define
        request: response.originalRequest
      }),
      originalRequest = {
        method: response.originalRequest.method,
        url: requestItem.request.url
      },
      originalRequestQueryParams = _.get(response, 'originalRequest.params.queryParams', []);

    /**
     * Setting variable
     * overriding `originalRequest.url.variable` as the url definition expects
     * 2. Field variable to be array of objects which maps to `clonedItemURL.variables.members`
     */
    originalRequest.url.variable = _.get(requestItem, 'request.url.variables.members', []);
    originalRequest.url.query = [];

    // setting query params
    if (originalRequestQueryParams.length) {
      originalRequest.url.query = _.reduce(originalRequestQueryParams, (acc, param) => {
        acc += `${param.key}=${param.value}&`;

        return acc;
      }, '');

      // Removing the last `&`
      originalRequest.url.query = originalRequest.url.query.slice(0, -1);
    }

    // Setting headers
    originalRequest.header = _.get(response, 'originalRequest.headers', []);
    originalRequest.body = requestItem.request.body;

    // replace 'X' char with '0'
    response.code = response.code.replace(/X|x/g, '0');
    response.code = response.code === 'default' ? 500 : _.toSafeInteger(response.code);

    let sdkResponse = new sdk.Response({
      name: response.name,
      code: response.code,
      header: response.headers,
      body: response.body,
      originalRequest: originalRequest
    });

    /**
     * Adding it here because sdk converts
     * _postman_previewlanguage to {'_': {'postman_previewlanguage': ''}}
     */
    sdkResponse._postman_previewlanguage = response._postman_previewlanguage;

    return sdkResponse;
  },
  generateRequestItemObject = (requestObject) => {
    const requestItem = new sdk.Item(requestObject),
      queryParams = _.get(requestObject, 'request.params.queryParams'),
      pathParams = _.get(requestObject, 'request.params.pathParams', []),
      headers = _.get(requestObject, 'request.headers', []),
      responses = _.get(requestObject, 'request.responses', []),
      auth = _.get(requestObject, 'request.auth', []);

    _.forEach(queryParams, (param) => {
      requestItem.request.url.addQueryParams(param);
    });

    _.forEach(headers, (header) => {
      requestItem.request.addHeader(header);
    });

    requestItem.request.url.variables.assimilate(pathParams);
    requestItem.request.auth = auth;

    _.forEach(responses, (response) => {
      requestItem.responses.add(generatePmResponseObject(response, requestItem));
    });

    /**
     * Following is added to make sure body pruning for request methods like GET, HEAD etc is disabled'.
     * https://github.com/postmanlabs/postman-runtime/blob/develop/docs/protocol-profile-behavior.md
     */
    requestItem.protocolProfileBehavior = { disableBodyPruning: true };

    return requestItem.toJSON();
  };

module.exports = {
  /**
   * Converts Title/Camel case to a space-separated string
   * @param {*} string - string in snake/camelCase
   * @returns {string} space-separated string
   */
  insertSpacesInName: function (string) {
    if (!string || (typeof string !== 'string')) {
      return '';
    }

    return string
      .replace(/([a-z])([A-Z])/g, '$1 $2') // convert createUser to create User
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // convert NASAMission to NASA Mission
      .replace(/(_+)([a-zA-Z0-9])/g, ' $2'); // convert create_user to create user
  },

  /**
   * Trims request name string to 255 characters.
   *
   * @param {*} reqName - Request name
   * @returns {*} trimmed string upto 255 characters
   */
  trimRequestName: function (reqName) {
    if (typeof reqName === 'string') {
      return reqName.substring(0, 255);
    }
    return reqName;
  },

  /**
   * Finds all the possible path variables conversion from schema path,
   * and excludes path variable that are converted to collection variable
   * @param {string} path Path string
   * @returns {array} Array of path variables.
   */
  findPathVariablesFromSchemaPath: function (path) {
    // /{path}/{file}.{format}/{hello} return [ '/{path}', '/{hello}' ]
    // https://regex101.com/r/aFRWQD/4
    let matches = path.match(/(\/\{[^\/\{\}]+\}(?=[\/\0]|$))/g);

    // remove leading '/' and starting and ending curly braces
    return _.map(matches, (match) => { return match.slice(2, -1); });
  },

  /** Finds all the possible path variables in a given path string
   * @param {string} path Path string : /pets/{petId}
   * @returns {array} Array of path variables.
   */
  findPathVariablesFromPath: function (path) {

    // /{{path}}/{{file}}.{{format}}/{{hello}} return [ '{{path}}', '{{hello}}' ]
    // https://regex101.com/r/XGL4Gh/1
    return path.match(/(\/\{\{[^\/\{\}]+\}\})(?=\/|$)/g);
  },

  /** Finds all the possible collection variables in a given path string
   * @param {string} path Path string : /pets/{petId}
   * @returns {array} Array of collection variables.
   */
  findCollectionVariablesFromPath: function (path) {

    // /:path/{{file}}.{{format}}/:hello => only {{file}} and {{format}} will match
    // https://regex101.com/r/XGL4Gh/2
    return path.match(/(\{\{[^\/\{\}]+\}\})/g);
  },

  /**
   * Changes path structure that contains {var} to :var and '/' to '_'
   * This is done so generated collection variable is in correct format
   * i.e. variable '{{item/{itemId}}}' is considered separates variable in URL by collection sdk
   * @param {string} path - path defined in openapi spec
   * @returns {string} - string after replacing {itemId} with :itemId
   */
  fixPathVariableName: function (path) {
    // Replaces structure like 'item/{itemId}' into 'item-itemId-Url'
    return path.replace(/\//g, '-').replace(/[{}]/g, '') + '-Url';
  },

  /**
  * Changes the {} around scheme and path variables to :variable
  * @param {string} url - the url string
  * @returns {string} string after replacing /{pet}/ with /:pet/
  */
  fixPathVariablesInUrl: function (url) {
    // URL should always be string so update value if non-string value is found
    if (typeof url !== 'string') {
      return '';
    }

    // All complicated logic removed
    // This simply replaces all instances of {text} with {{text}}
    // text cannot have any of these 3 chars: /{}
    // {{text}} will not be converted

    let replacer = function (match, p1, offset, string) {
      if (string[offset - 1] === '{' && string[offset + match.length + 1] !== '}') {
        return match;
      }
      return '{' + p1 + '}';
    };
    return _.isString(url) ? url.replace(/(\{[^\/\{\}]+\})/g, replacer) : '';
  },

  generatePmResponseObject,
  generateRequestItemObject
};
