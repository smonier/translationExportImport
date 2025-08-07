# Content Translation Export Import Module

This project is a Jahia 8 module that adds a React-based administration panel for exporting and importing content translations. It registers a custom route in the Jahia administration interface and communicates with Jahia's GraphQL API.

## Features

- Access an administration entry dedicated to translation management.
- Export internationalised properties from any part of a site to a JSON file with a preview step and custom filename.
- Filter exports by language and by a specific subtree of the site.
- Import translations from a JSON file and apply them to a chosen language.
- Support for single and multi-value properties and a summary report of modified and failed items.

## Getting started

### Prerequisites

- Jahia 8.2 or later
- Java and Maven
- Node.js v24.4.1 and Yarn v1.22.11 (installed automatically during the Maven build)

### Building the module

```bash
mvn clean install
```

The build uses the `frontend-maven-plugin` to install Node and Yarn, install dependencies with `yarn`, and run `yarn build:production`. The resulting module JAR can be deployed to Jahia via the Module Manager or by copying it into the Jahia `modules` directory.

### Development

- `yarn dev` – watch mode for front-end assets.
- `yarn build` – lint and build in development mode.
- `yarn build:production` – build production assets.

### Testing and linting

- `yarn test` – run Jest tests.
- `yarn lint` – run ESLint.

## Usage

1. Deploy the module and log in to Jahia as an administrator and activate it.
2. Open the Additional Panel on the desired site and choose **Export / Import Translation**.
3. Use the start panel to pick either **Export** or **Import**.

### Exporting translations

1. Select a content path within the current site and a language.
2. Click **Export translations** to fetch internationalised properties.
3. Review the JSON preview and confirm to download the file.

### Importing translations

1. Choose the target language.
2. Upload a JSON file produced by the export process.
3. Click **Import** to apply the translations. A report summarises modified and failed items.

#### JSON format

The import process expects an array of objects where each object defines a node `uuid` and a list of `properties`. Each property contains a `name` and either a `value` or a list of `values`:

```json
[
  {
    "uuid": "xxxx-xxxx-xxxx-xxxx",
    "properties": [
      {"name": "jcr:title", "value": "Hello"},
      {"name": "jcr:keywords", "values": ["one", "two"]}
    ]
  }
]
```

## License

This project is licensed under the MIT License.
