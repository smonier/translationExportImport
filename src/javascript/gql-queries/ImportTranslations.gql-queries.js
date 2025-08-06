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
