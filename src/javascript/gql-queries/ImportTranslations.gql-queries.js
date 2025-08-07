import {gql} from '@apollo/client';

export const ApplyTranslationsMutation = gql`
    mutation ApplyTranslations($uuid: String!, $language: String!, $property: String!, $value: String!) {
        jcr {
            mutateNode(pathOrId: $uuid) {
                mutateProperty(name: $property) {
                    setValue(language: $language, value: $value)
                }
            }
        }
    }
`;

export const ApplyTranslationsOnMultipleMutation = gql`
    mutation ApplyTranslationsOnMultiple($uuid: String!, $language: String!, $property: String!, $values: [String]!) {
        jcr {
            mutateNode(pathOrId: $uuid) {
                mutateProperty(name: $property) {
                    setValues(language: $language, values: $values)
                }
            }
        }
    }
`;
