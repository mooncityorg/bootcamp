const { getReferences } = require('../../lib/bundle.js'),
  { removeLocalReferenceFromPath } = require('../../lib/jsonPointer.js'),
  parse = require('./../../lib/parse');

let expect = require('chai').expect,
  Converter = require('../../index.js'),
  fs = require('fs'),
  path = require('path'),
  BUNDLES_FOLDER = '../data/toBundleExamples',
  PETSTORE_FOLDER = '../data/petstore separate yaml',
  nestedRefsFromRootComponents = path.join(__dirname, BUNDLES_FOLDER + '/nested_references_from_root_components'),
  localRefFolder = path.join(__dirname, BUNDLES_FOLDER + '/local_references'),
  schemaFromResponse = path.join(__dirname, BUNDLES_FOLDER + '/schema_from_response'),
  petstoreFolder = path.join(__dirname, PETSTORE_FOLDER),
  withParamsFolder = path.join(__dirname, BUNDLES_FOLDER + '/with_parameters'),
  withRefInItems = path.join(__dirname, BUNDLES_FOLDER + '/with_ref_in_items'),
  sameRefDiffSource = path.join(__dirname, BUNDLES_FOLDER + '/same_ref_different_source'),
  nestedHard = path.join(__dirname, BUNDLES_FOLDER + '/multiple_references_from_root_components'),
  localFromExternal = path.join(__dirname, BUNDLES_FOLDER + '/bring_local_dependencies_from_external'),
  localFromExternalMultiple = path
    .join(__dirname, BUNDLES_FOLDER + '/bring_local_dependencies_from_external_multiple_local'),
  refTags = path.join(__dirname, BUNDLES_FOLDER + '/referenced_tags'),
  refInfo = path.join(__dirname, BUNDLES_FOLDER + '/referenced_info'),
  refPaths = path.join(__dirname, BUNDLES_FOLDER + '/referenced_paths'),
  SWAGGER_MULTIFILE_FOLDER = '../data/toBundleExamples/swagger20',
  refPathsRefToLocalSchema = path.join(__dirname, BUNDLES_FOLDER + '/referenced_paths_local_schema'),
  refInfo20 = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/referenced_info'),
  refTags20 = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/referenced_tags'),
  basicExample = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/basicExample'),
  refPaths20 = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/referenced_paths'),
  refPathsRefToLocalSchema20 = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/referenced_paths_local_schema'),
  refExample = path.join(__dirname, BUNDLES_FOLDER + '/referenced_examples'),
  nestedRefs = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/nestedRefs'),
  nestedLocalRef = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/nestedLocalRef'),
  withParametersAndItems = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/withParametersAndItems'),
  bringLocalFromExternal = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/bringLocalDependenciesFromExternal'),
  bringLocalFromExternalWithItems = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER +
    '/bringLocalDependenciesFromExternalWithItems'),
  bringLocalFromExternalMultiple = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER +
    '/bringLocalDependenciesFromExternalMultiple'),
  multipleRefFromRootComponents = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/multipleRefFromRootComponents'),
  sameRefDifferentSource = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/sameRefDifferentSource'),
  simpleRef = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/simpleRef'),
  refExample20 = path.join(__dirname, SWAGGER_MULTIFILE_FOLDER + '/referenced_example');

describe('bundle files method - 3.0', function () {
  it('Should return bundled file as json - schema_from_response', async function () {
    let contentRootFile = fs.readFileSync(schemaFromResponse + '/root.yaml', 'utf8'),
      user = fs.readFileSync(schemaFromResponse + '/schemas/user.yaml', 'utf8'),
      expected = fs.readFileSync(schemaFromResponse + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/schemas/user.yaml',
            content: user
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file as yaml - schema_from_response', async function () {
    let contentRootFile = fs.readFileSync(schemaFromResponse + '/root.yaml', 'utf8'),
      user = fs.readFileSync(schemaFromResponse + '/schemas/user.yaml', 'utf8'),
      expected = fs.readFileSync(schemaFromResponse + '/expected.yaml', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/schemas/user.yaml',
            content: user
          }
        ],
        options: {},
        bundleFormat: 'yaml'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file in same format than root file - schema_from_response', async function () {
    let contentRootFile = fs.readFileSync(schemaFromResponse + '/root.yaml', 'utf8'),
      user = fs.readFileSync(schemaFromResponse + '/schemas/user.yaml', 'utf8'),
      expected = fs.readFileSync(schemaFromResponse + '/expected.yaml', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/schemas/user.yaml',
            content: user
          }
        ],
        options: {}
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file - nested_references_from_root_components', async function () {
    let contentRootFile = fs.readFileSync(nestedRefsFromRootComponents + '/v1.yaml', 'utf8'),
      responses = fs.readFileSync(nestedRefsFromRootComponents + '/responses.yaml', 'utf8'),
      schemasIndex = fs.readFileSync(nestedRefsFromRootComponents + '/schemas/index.yaml', 'utf8'),
      schemasUser = fs.readFileSync(nestedRefsFromRootComponents + '/schemas/user.yaml', 'utf8'),
      schemasClient = fs.readFileSync(nestedRefsFromRootComponents + '/schemas/client.yaml', 'utf8'),
      toySchema = fs.readFileSync(nestedRefsFromRootComponents + '/otherSchemas/toy.yaml', 'utf8'),
      userProps = fs.readFileSync(nestedRefsFromRootComponents + '/userProps.yaml', 'utf8'),
      expected = fs.readFileSync(nestedRefsFromRootComponents + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/v1.yaml',
            content: contentRootFile
          }
        ],
        options: {},
        bundleFormat: 'JSON',
        data: [
          {
            path: '/responses.yaml',
            content: responses
          },
          {
            path: '/schemas/index.yaml',
            content: schemasIndex
          },
          {
            path: '/schemas/client.yaml',
            content: schemasClient
          },
          {
            path: '/schemas/user.yaml',
            content: schemasUser
          },
          {
            path: '/otherSchemas/toy.yaml',
            content: toySchema
          },
          {
            path: '/userProps.yaml',
            content: userProps
          }
        ]
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file - local_references', async function () {
    let contentRootFile = fs.readFileSync(localRefFolder + '/root.yaml', 'utf8'),
      responses = fs.readFileSync(localRefFolder + '/responses.yaml', 'utf8'),
      schemasIndex = fs.readFileSync(localRefFolder + '/schemas/index.yaml', 'utf8'),
      schemasClient = fs.readFileSync(localRefFolder + '/schemas/client.yaml', 'utf8'),
      toySchema = fs.readFileSync(localRefFolder + '/otherSchemas/toy.yaml', 'utf8'),
      expected = fs.readFileSync(localRefFolder + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        options: {},
        bundleFormat: 'JSON',
        data: [
          {
            path: '/responses.yaml',
            content: responses
          },
          {
            path: '/schemas/index.yaml',
            content: schemasIndex
          },
          {
            path: '/schemas/client.yaml',
            content: schemasClient
          },
          {
            path: '/otherSchemas/toy.yaml',
            content: toySchema
          }
        ]
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file - petstore separated example', async function () {
    let contentRootFile = fs.readFileSync(petstoreFolder + '/spec/swagger.yaml', 'utf8'),
      newPet = fs.readFileSync(petstoreFolder + '/spec/NewPet.yaml', 'utf8'),
      openapi = fs.readFileSync(petstoreFolder + '/spec/openapi.yaml', 'utf8'),
      parameters = fs.readFileSync(petstoreFolder + '/spec/parameters.yaml', 'utf8'),
      pet = fs.readFileSync(petstoreFolder + '/spec/Pet.yaml', 'utf8'),
      schemasIndex = fs.readFileSync(petstoreFolder + '/schemas/_index.yaml', 'utf8'),
      error = fs.readFileSync(petstoreFolder + '/schemas/Error.yaml', 'utf8'),
      petSchema = fs.readFileSync(petstoreFolder + '/schemas/Pet.yaml', 'utf8'),
      responsesIndex = fs.readFileSync(petstoreFolder + '/responses/_index.yaml', 'utf8'),
      nullResponse = fs.readFileSync(petstoreFolder + '/responses/NullResponse.yaml', 'utf8'),
      unexpectedError = fs.readFileSync(petstoreFolder + '/responses/UnexpectedError.yaml', 'utf8'),
      petResource = fs.readFileSync(petstoreFolder + '/resources/pet.yaml', 'utf8'),
      petsResource = fs.readFileSync(petstoreFolder + '/resources/pets.yaml', 'utf8'),
      parametersIndex = fs.readFileSync(petstoreFolder + '/parameters/_index.yaml', 'utf8'),
      limitParameter = fs.readFileSync(petstoreFolder + '/parameters/query/limit.yaml', 'utf8'),
      petIdParameter = fs.readFileSync(petstoreFolder + '/parameters/path/petId.yaml', 'utf8'),
      errorCommon = fs.readFileSync(petstoreFolder + '/common/Error.yaml', 'utf8'),
      expected = fs.readFileSync(petstoreFolder + '/bundleExp.yaml', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/spec/swagger.yaml',
            content: contentRootFile
          }
        ],
        options: {},
        bundleFormat: 'yaml',
        data: [
          {
            path: '/spec/NewPet.yaml',
            content: newPet
          },
          {
            path: '/spec/openapi.yaml',
            content: openapi
          },
          {
            path: '/spec/parameters.yaml',
            content: parameters
          },
          {
            path: '/spec/Pet.yaml',
            content: pet
          },
          {
            path: '/schemas/_index.yaml',
            content: schemasIndex
          },
          {
            path: '/schemas/Error.yaml',
            content: error
          },
          {
            path: '/schemas/Pet.yaml',
            content: petSchema
          },
          {
            path: '/responses/_index.yaml',
            content: responsesIndex
          },
          {
            path: '/responses/NullResponse.yaml',
            content: nullResponse
          },
          {
            path: '/responses/UnexpectedError.yaml',
            content: unexpectedError
          },
          {
            path: '/resources/pet.yaml',
            content: petResource
          },
          {
            path: '/resources/pets.yaml',
            content: petsResource
          },
          {
            path: '/parameters/_index.yaml',
            content: parametersIndex
          },
          {
            path: '/parameters/path/petId.yaml',
            content: petIdParameter
          },
          {
            path: '/parameters/query/limit.yaml',
            content: limitParameter
          },
          {
            path: '/common/Error.yaml',
            content: errorCommon
          }
        ]
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file - with_parameters', async function () {
    let contentRootFile = fs.readFileSync(withParamsFolder + '/root.yaml', 'utf8'),
      user = fs.readFileSync(withParamsFolder + '/schemas/user.yaml', 'utf8'),
      parameters = fs.readFileSync(withParamsFolder + '/parameters/index.yaml', 'utf8'),
      expected = fs.readFileSync(withParamsFolder + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        options: {},
        bundleFormat: 'JSON',
        data: [
          {
            path: '/schemas/user.yaml',
            content: user
          },
          {
            path: '/parameters/index.yaml',
            content: parameters
          }
        ]
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file - with_ref_in_items', async function () {
    let contentRootFile = fs.readFileSync(withRefInItems + '/root.yaml', 'utf8'),
      user = fs.readFileSync(withRefInItems + '/schemas/user.yaml', 'utf8'),
      superProp = fs.readFileSync(withRefInItems + '/schemas/superProp.yaml', 'utf8'),
      expected = fs.readFileSync(withRefInItems + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        options: {},
        bundleFormat: 'JSON',
        data: [
          {
            path: '/schemas/user.yaml',
            content: user
          },
          {
            path: '/schemas/superProp.yaml',
            content: superProp
          }
        ]
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent)
      .to.be.equal(expected);
  });

  it('Should return error data - with_ref_in_items - wrong root', async function () {
    let contentRootFile = fs.readFileSync(withRefInItems + '/wrongRoot.yaml', 'utf8'),
      user = fs.readFileSync(withRefInItems + '/schemas/user.yaml', 'utf8'),
      superProp = fs.readFileSync(withRefInItems + '/schemas/superProp.yaml', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/wrongRoot.yaml',
            content: contentRootFile
          }
        ],
        options: {},
        bundleFormat: 'JSON',
        data: [
          {
            path: '/schemas/user.yaml',
            content: user
          },
          {
            path: '/schemas/superProp.yaml',
            content: superProp
          }
        ]
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.false;
    expect(res.reason).to.equal('Invalid format. Input must be in YAML or JSON ' +
      'format. Specification is not a valid YAML. YAMLException: duplicated mapping' +
      ' key at line 30, column -54:\n    components:\n    ^');
  });

  it('Should return bundled file from same_ref_different_source', async function () {
    let contentRootFile = fs.readFileSync(sameRefDiffSource + '/root.yaml', 'utf8'),
      user = fs.readFileSync(sameRefDiffSource + '/schemas/user/user.yaml', 'utf8'),
      client = fs.readFileSync(sameRefDiffSource + '/schemas/client/client.yaml', 'utf8'),
      specialUser = fs.readFileSync(sameRefDiffSource + '/schemas/user/special.yaml', 'utf8'),
      specialClient = fs.readFileSync(sameRefDiffSource + '/schemas/client/special.yaml', 'utf8'),
      magic = fs.readFileSync(sameRefDiffSource + '/schemas/client/magic.yaml', 'utf8'),
      expected = fs.readFileSync(sameRefDiffSource + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/schemas/user/user.yaml',
            content: user
          },
          {
            path: '/schemas/user/special.yaml',
            content: specialUser
          },
          {
            path: '/schemas/client/client.yaml',
            content: client
          },
          {
            path: '/schemas/client/special.yaml',
            content: specialClient
          },
          {
            path: '/schemas/client/magic.yaml',
            content: magic
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file - multiple_references_from_root_components', async function () {
    let contentRootFile = fs.readFileSync(nestedHard + '/root.yaml', 'utf8'),
      responses = fs.readFileSync(nestedHard + '/responses.yaml', 'utf8'),
      userProps = fs.readFileSync(nestedHard + '/userProps.yaml', 'utf8'),
      schemasIndex = fs.readFileSync(nestedHard + '/schemas/index.yaml', 'utf8'),
      schemasUser = fs.readFileSync(nestedHard + '/schemas/user.yaml', 'utf8'),
      schemasClient = fs.readFileSync(nestedHard + '/schemas/client.yaml', 'utf8'),
      schemasCarType = fs.readFileSync(nestedHard + '/schemas/carType.yaml', 'utf8'),
      otherModel = fs.readFileSync(nestedHard + '/otherSchemas/model.yaml', 'utf8'),
      othersToy = fs.readFileSync(nestedHard + '/otherSchemas/toy.yaml', 'utf8'),
      othersWork = fs.readFileSync(nestedHard + '/otherSchemas/work.yaml', 'utf8'),
      expected = fs.readFileSync(nestedHard + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/responses.yaml',
            content: responses
          },
          {
            path: '/userProps.yaml',
            content: userProps
          },
          {
            path: '/schemas/index.yaml',
            content: schemasIndex
          },
          {
            path: '/schemas/user.yaml',
            content: schemasUser
          },
          {
            path: '/schemas/client.yaml',
            content: schemasClient
          },
          {
            path: '/schemas/carType.yaml',
            content: schemasCarType
          },
          {
            path: '/otherSchemas/model.yaml',
            content: otherModel
          },
          {
            path: '/otherSchemas/toy.yaml',
            content: othersToy
          },
          {
            path: '/otherSchemas/work.yaml',
            content: othersWork
          }
        ],
        options: {},
        bundleFormat: 'json'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file as json - bring_local_dependencies_from_external', async function () {
    let contentRootFile = fs.readFileSync(localFromExternal + '/root.yaml', 'utf8'),
      user = fs.readFileSync(localFromExternal + '/schemas/user.yaml', 'utf8'),
      expected = fs.readFileSync(localFromExternal + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/schemas/user.yaml',
            content: user
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file as json - bring_local_dependencies_from_external_multiple_local', async function () {
    let contentRootFile = fs.readFileSync(localFromExternalMultiple + '/root.yaml', 'utf8'),
      user = fs.readFileSync(localFromExternalMultiple + '/schemas/user.yaml', 'utf8'),
      food = fs.readFileSync(localFromExternalMultiple + '/schemas/food.yaml', 'utf8'),
      expected = fs.readFileSync(localFromExternalMultiple + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/schemas/user.yaml',
            content: user
          },
          {
            path: '/schemas/food.yaml',
            content: food
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return a "/missing/node/path": NotProvided' +
    ' in the place of a not providen node - local_references', async function () {
    let contentRootFile = fs.readFileSync(localRefFolder + '/root.yaml', 'utf8'),
      schemasIndex = fs.readFileSync(localRefFolder + '/schemas/index.yaml', 'utf8'),
      schemasClient = fs.readFileSync(localRefFolder + '/schemas/client.yaml', 'utf8'),
      toySchema = fs.readFileSync(localRefFolder + '/otherSchemas/toy.yaml', 'utf8'),
      expected = fs.readFileSync(localRefFolder + '/expectedNodeNotProvided.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        options: {},
        bundleFormat: 'JSON',
        data: [
          {
            path: '/schemas/index.yaml',
            content: schemasIndex
          },
          {
            path: '/schemas/client.yaml',
            content: schemasClient
          },
          {
            path: '/otherSchemas/toy.yaml',
            content: toySchema
          }
        ]
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file with referenced tags from root', async function () {
    let contentRootFile = fs.readFileSync(refTags + '/root.yaml', 'utf8'),
      tags = fs.readFileSync(refTags + '/tags/tags.yaml', 'utf8'),
      expected = fs.readFileSync(refTags + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/tags/tags.yaml',
            content: tags
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file with referenced info from root', async function () {
    let contentRootFile = fs.readFileSync(refInfo + '/root.yaml', 'utf8'),
      info = fs.readFileSync(refInfo + '/info/info.yaml', 'utf8'),
      expected = fs.readFileSync(refInfo + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info/info.yaml',
            content: info
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file with referenced paths from root', async function () {
    let contentRootFile = fs.readFileSync(refPaths + '/root.yaml', 'utf8'),
      paths = fs.readFileSync(refPaths + '/paths/paths.yaml', 'utf8'),
      path = fs.readFileSync(refPaths + '/paths/path.yaml', 'utf8'),
      expected = fs.readFileSync(refPaths + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/paths/paths.yaml',
            content: paths
          },
          {
            path: '/paths/path.yaml',
            content: path
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file with referenced paths from root - path references local schema', async function () {
    let contentRootFile = fs.readFileSync(refPathsRefToLocalSchema + '/root.yaml', 'utf8'),
      paths = fs.readFileSync(refPathsRefToLocalSchema + '/paths/paths.yaml', 'utf8'),
      path = fs.readFileSync(refPathsRefToLocalSchema + '/paths/path.yaml', 'utf8'),
      expected = fs.readFileSync(refPathsRefToLocalSchema + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/paths/paths.yaml',
            content: paths
          },
          {
            path: '/paths/path.yaml',
            content: path
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file with referenced example', async function () {
    let contentRootFile = fs.readFileSync(refExample + '/root.yaml', 'utf8'),
      example = fs.readFileSync(refExample + '/examples.yaml', 'utf8'),
      expected = fs.readFileSync(refExample + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '3.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/examples.yaml',
            content: example
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('should return error when "type" parameter is not sent', async function () {
    let contentRootFile = fs.readFileSync(refExample + '/root.yaml', 'utf8'),
      example = fs.readFileSync(refExample + '/examples.yaml', 'utf8'),
      input = {
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/examples.yaml',
            content: example
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    try {
      await Converter.bundle(input);
    }
    catch (error) {
      expect(error).to.not.be.undefined;
      expect(error.message).to.equal('"Type" parameter should be provided');
    }
  });

  it('should return error when input is an empty object', async function () {
    try {
      await Converter.bundle({});
    }
    catch (error) {
      expect(error).to.not.be.undefined;
      expect(error.message).to.equal('Input object must have "type" and "data" information');
    }
  });
});

describe('bundle files method - 2.0', function() {
  it('Should return bundled result from - sameRefDifferentSource', async function() {
    let contentRootFile = fs.readFileSync(sameRefDifferentSource + '/index.yaml', 'utf8'),
      info = fs.readFileSync(sameRefDifferentSource + '/info.yaml', 'utf8'),
      paths = fs.readFileSync(sameRefDifferentSource + '/paths.yaml', 'utf8'),
      user = fs.readFileSync(sameRefDifferentSource + '/schemas/user.yaml', 'utf8'),
      userDetail = fs.readFileSync(sameRefDifferentSource + '/schemas/detail.yaml', 'utf8'),
      client = fs.readFileSync(sameRefDifferentSource + '/otherSchemas/client.yaml', 'utf8'),
      clientDetail = fs.readFileSync(sameRefDifferentSource + '/otherSchemas/detail.yaml', 'utf8'),
      expected = fs.readFileSync(sameRefDifferentSource + '/bundleExpected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/index.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info.yaml',
            content: info
          },
          {
            path: '/paths.yaml',
            content: paths
          },
          {
            path: '/schemas/user.yaml',
            content: user
          },
          {
            path: '/schemas/detail.yaml',
            content: userDetail
          },
          {
            path: '/otherSchemas/client.yaml',
            content: client
          },
          {
            path: '/otherSchemas/detail.yaml',
            content: clientDetail
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled result from - multipleRefFromRootComponents', async function() {
    let contentRootFile = fs.readFileSync(multipleRefFromRootComponents + '/index.yaml', 'utf8'),
      info = fs.readFileSync(multipleRefFromRootComponents + '/info.yaml', 'utf8'),
      paths = fs.readFileSync(multipleRefFromRootComponents + '/paths.yaml', 'utf8'),
      pet = fs.readFileSync(multipleRefFromRootComponents + '/pet.yaml', 'utf8'),
      parameters = fs.readFileSync(multipleRefFromRootComponents + '/parameters/parameters.yaml', 'utf8'),
      expected = fs.readFileSync(multipleRefFromRootComponents + '/bundleExpected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/index.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info.yaml',
            content: info
          },
          {
            path: '/paths.yaml',
            content: paths
          },
          {
            path: '/pet.yaml',
            content: pet
          },
          {
            path: '/parameters/parameters.yaml',
            content: parameters
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled result from - bringLocalDependenciesFromExternalMultiple', async function() {
    let contentRootFile = fs.readFileSync(bringLocalFromExternalMultiple + '/index.yaml', 'utf8'),
      info = fs.readFileSync(bringLocalFromExternalMultiple + '/info.yaml', 'utf8'),
      paths = fs.readFileSync(bringLocalFromExternalMultiple + '/paths.yaml', 'utf8'),
      pet = fs.readFileSync(bringLocalFromExternalMultiple + '/pet.yaml', 'utf8'),
      food = fs.readFileSync(bringLocalFromExternalMultiple + '/food.yaml', 'utf8'),
      parameters = fs.readFileSync(bringLocalFromExternalMultiple + '/parameters/parameters.yaml', 'utf8'),
      expected = fs.readFileSync(bringLocalFromExternalMultiple + '/bundleExpected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/index.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info.yaml',
            content: info
          },
          {
            path: '/paths.yaml',
            content: paths
          },
          {
            path: '/pet.yaml',
            content: pet
          },
          {
            path: '/food.yaml',
            content: food
          },
          {
            path: '/parameters/parameters.yaml',
            content: parameters
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled result from - bringLocalDependenciesFromExternalWithItems', async function() {
    let contentRootFile = fs.readFileSync(bringLocalFromExternalWithItems + '/index.yaml', 'utf8'),
      info = fs.readFileSync(bringLocalFromExternalWithItems + '/info.yaml', 'utf8'),
      paths = fs.readFileSync(bringLocalFromExternalWithItems + '/paths.yaml', 'utf8'),
      pet = fs.readFileSync(bringLocalFromExternalWithItems + '/pet.yaml', 'utf8'),
      expected = fs.readFileSync(bringLocalFromExternalWithItems + '/bundleExpected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/index.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info.yaml',
            content: info
          },
          {
            path: '/paths.yaml',
            content: paths
          },
          {
            path: '/pet.yaml',
            content: pet
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled result from - bringLocalDependenciesFromExternal', async function() {
    let contentRootFile = fs.readFileSync(bringLocalFromExternal + '/index.yaml', 'utf8'),
      info = fs.readFileSync(bringLocalFromExternal + '/info.yaml', 'utf8'),
      paths = fs.readFileSync(bringLocalFromExternal + '/paths.yaml', 'utf8'),
      pet = fs.readFileSync(bringLocalFromExternal + '/pet.yaml', 'utf8'),
      expected = fs.readFileSync(bringLocalFromExternal + '/bundleExpected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/index.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info.yaml',
            content: info
          },
          {
            path: '/paths.yaml',
            content: paths
          },
          {
            path: '/pet.yaml',
            content: pet
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled result from - withParametersAndItems', async function() {
    let contentRootFile = fs.readFileSync(withParametersAndItems + '/index.yaml', 'utf8'),
      info = fs.readFileSync(withParametersAndItems + '/info.yaml', 'utf8'),
      paths = fs.readFileSync(withParametersAndItems + '/paths.yaml', 'utf8'),
      pet = fs.readFileSync(withParametersAndItems + '/pet.yaml', 'utf8'),
      parameters = fs.readFileSync(withParametersAndItems + '/parameters/parameters.yaml', 'utf8'),
      expected = fs.readFileSync(withParametersAndItems + '/bundleExpected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/index.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info.yaml',
            content: info
          },
          {
            path: '/paths.yaml',
            content: paths
          },
          {
            path: '/pet.yaml',
            content: pet
          },
          {
            path: '/parameters/parameters.yaml',
            content: parameters
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled result from - nestedLocalRef', async function() {
    let contentRootFile = fs.readFileSync(nestedLocalRef + '/index.yaml', 'utf8'),
      info = fs.readFileSync(nestedLocalRef + '/info.yaml', 'utf8'),
      paths = fs.readFileSync(nestedLocalRef + '/paths.yaml', 'utf8'),
      pet = fs.readFileSync(nestedLocalRef + '/schemas/pet.yaml', 'utf8'),
      favoriteFood = fs.readFileSync(nestedLocalRef + '/schemas/favorite_food.yaml', 'utf8'),
      expected = fs.readFileSync(nestedLocalRef + '/bundleExpected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/index.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info.yaml',
            content: info
          },
          {
            path: '/paths.yaml',
            content: paths
          },
          {
            path: '/schemas/pet.yaml',
            content: pet
          },
          {
            path: '/schemas/favorite_food.yaml',
            content: favoriteFood
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled result from - nestedRefs', async function() {
    let contentRootFile = fs.readFileSync(nestedRefs + '/index.yaml', 'utf8'),
      info = fs.readFileSync(nestedRefs + '/info.yaml', 'utf8'),
      paths = fs.readFileSync(nestedRefs + '/paths.yaml', 'utf8'),
      pet = fs.readFileSync(nestedRefs + '/schemas/pet.yaml', 'utf8'),
      favoriteFood = fs.readFileSync(nestedRefs + '/schemas/favorite_food.yaml', 'utf8'),
      expected = fs.readFileSync(nestedRefs + '/bundleExpected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/index.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info.yaml',
            content: info
          },
          {
            path: '/paths.yaml',
            content: paths
          },
          {
            path: '/schemas/pet.yaml',
            content: pet
          },
          {
            path: '/schemas/favorite_food.yaml',
            content: favoriteFood
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled result from - basicExample', async function() {
    let contentRootFile = fs.readFileSync(basicExample + '/index.yaml', 'utf8'),
      info = fs.readFileSync(basicExample + '/info.yaml', 'utf8'),
      paths = fs.readFileSync(basicExample + '/paths.yaml', 'utf8'),
      expected = fs.readFileSync(basicExample + '/bundleExpected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/index.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info.yaml',
            content: info
          },
          {
            path: '/paths.yaml',
            content: paths
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled result from - simpleRef', async function() {
    let contentRootFile = fs.readFileSync(simpleRef + '/index.yaml', 'utf8'),
      info = fs.readFileSync(simpleRef + '/info.yaml', 'utf8'),
      paths = fs.readFileSync(simpleRef + '/paths.yaml', 'utf8'),
      pet = fs.readFileSync(simpleRef + '/pet.yaml', 'utf8'),
      expected = fs.readFileSync(simpleRef + '/bundleExpected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/index.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info.yaml',
            content: info
          },
          {
            path: '/paths.yaml',
            content: paths
          },
          {
            path: '/pet.yaml',
            content: pet
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file with referenced info from root', async function () {
    let contentRootFile = fs.readFileSync(refInfo20 + '/root.yaml', 'utf8'),
      info = fs.readFileSync(refInfo20 + '/info/info.yaml', 'utf8'),
      expected = fs.readFileSync(refInfo20 + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/info/info.yaml',
            content: info
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file with referenced tags from root', async function () {
    let contentRootFile = fs.readFileSync(refTags20 + '/root.yaml', 'utf8'),
      tags = fs.readFileSync(refTags20 + '/tags/tags.yaml', 'utf8'),
      expected = fs.readFileSync(refTags20 + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/tags/tags.yaml',
            content: tags
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file with referenced paths from root', async function () {
    let contentRootFile = fs.readFileSync(refPaths20 + '/root.yaml', 'utf8'),
      paths = fs.readFileSync(refPaths20 + '/paths/paths.yaml', 'utf8'),
      path = fs.readFileSync(refPaths20 + '/paths/path.yaml', 'utf8'),
      expected = fs.readFileSync(refPaths20 + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/paths/paths.yaml',
            content: paths
          },
          {
            path: '/paths/path.yaml',
            content: path
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file with referenced paths from root - path references local schema', async function () {
    let contentRootFile = fs.readFileSync(refPathsRefToLocalSchema20 + '/root.yaml', 'utf8'),
      paths = fs.readFileSync(refPathsRefToLocalSchema20 + '/paths/paths.yaml', 'utf8'),
      path = fs.readFileSync(refPathsRefToLocalSchema20 + '/paths/path.yaml', 'utf8'),
      expected = fs.readFileSync(refPathsRefToLocalSchema20 + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/paths/paths.yaml',
            content: paths
          },
          {
            path: '/paths/path.yaml',
            content: path
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });

  it('Should return bundled file with referenced example', async function () {
    let contentRootFile = fs.readFileSync(refExample20 + '/root.yaml', 'utf8'),
      examples = fs.readFileSync(refExample20 + '/examples.yaml', 'utf8'),
      expected = fs.readFileSync(refExample20 + '/expected.json', 'utf8'),
      input = {
        type: 'folder',
        specificationVersion: '2.0',
        rootFiles: [
          {
            path: '/root.yaml',
            content: contentRootFile
          }
        ],
        data: [
          {
            path: '/examples.yaml',
            content: examples
          }
        ],
        options: {},
        bundleFormat: 'JSON'
      };
    const res = await Converter.bundle(input);
    expect(res).to.not.be.empty;
    expect(res.result).to.be.true;
    expect(res.output.data.bundledContent).to.be.equal(expected);
  });
});

describe('getReferences method when node does not have any reference', function() {
  it('Should return reference data empty if there are not any reference', function() {
    const userData = 'type: object\n' +
        'properties:\n' +
        '  id:\n' +
        '    type: integer\n' +
        '  userName:\n' +
        '    type: string',
      userNode = parse.getOasObject(userData),
      nodeIsRoot = false,
      result = getReferences(
        userNode.oasObject,
        nodeIsRoot,
        removeLocalReferenceFromPath,
        'the/parent/filename'
      );

    expect(result.referencesInNode).to.be.an('array').with.length(0);
    expect(Object.keys(result.nodeReferenceDirectory).length).to.equal(0);
  });

  it('Should return the reference data - schema_from_response', function() {
    const userData = 'User:\n' +
      '  $ref: \"./user.yaml\"\n' +
      '\n' +
      'Monster:\n' +
      '  type: object\n' +
      '  properties:\n' +
      '    id:\n' +
      '      type: integer\n' +
      '    clientName:\n' +
      '      type: string\n' +
      'Dog:\n' +
      '  type: object\n' +
      '  properties:\n' +
      '    id:\n' +
      '      type: integer\n' +
      '    clientName:\n' +
      '      type: string',
      userNode = parse.getOasObject(userData),
      nodeIsRoot = false,
      result = getReferences(
        userNode.oasObject,
        nodeIsRoot,
        removeLocalReferenceFromPath,
        'the/parent/filename'
      );
    expect(result.nodeReferenceDirectory).to.be.an('object');
    expect(Object.keys(result.nodeReferenceDirectory).length).to.equal(1);
    expect(result.referencesInNode).to.be.an('array').with.length(1);
    expect(Object.keys(result.nodeReferenceDirectory)[0])
      .to.equal('the/parent/user.yaml');
    expect(result.referencesInNode[0].path).to.equal('./user.yaml');
    expect(result.referencesInNode[0].newValue.$ref).to.equal('the/parent/user.yaml');
  });
});
