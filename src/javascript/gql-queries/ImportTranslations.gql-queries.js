import {gql} from '@apollo/client';

export const UpdateContentMutation = gql`
    mutation UpdateContentMutation($pathOrId: String!, $properties: [InputJCRProperty] = []) {
        jcr(workspace: EDIT) {
            mutateNode(pathOrId: $pathOrId) {
                setPropertiesBatch(properties: $properties) {
                    path
                }
                uuid
            }
        }
    }
`;
