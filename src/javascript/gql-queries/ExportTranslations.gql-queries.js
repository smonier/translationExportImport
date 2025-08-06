import {gql} from '@apollo/client';

export const GetSiteLanguagesQuery = gql`
    query GetSiteLanguages($workspace: Workspace!, $scope: String!) {
        jcr(workspace: $workspace) {
            nodeByPath(path: $scope) {
                displayName
                isDisplayableNode
                languages: property(name: "j:languages") {
                    values
                }
            }
        }
    }
`;

export const FetchSiteInternationalizedContents = gql`
    query FetchInternationalizedDescendants($path: String!, $language: String!) {
        jcr {
            nodeByPath(path: $path) {
                descendants {
                    nodes {
                        uuid
                        path
                        name
                        displayName(language: $language)
                        primaryNodeType {
                            name
                        }
                        properties(fieldFilter: {filters: [{fieldName: "internationalized", value: "true"}]}, language: $language) {
                            name
                            value
                            values
                        }
                    }
                }
            }
        }
    }
`;
