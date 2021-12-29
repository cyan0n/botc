const formatLabel = (label: string) =>
  `:${label.charAt(0).toUpperCase() + label.slice(1)}`;

const formatRelationship = (relationship: string) => `:re`;
const toNode = (object: any) => {
  return JSON.stringify(object).replace(/"([^"]+)":/g, "$1:");
};

export const cypherNode = (
  labels: string | string[],
  props?: any,
  slug: string = "",
) => {
  if (typeof labels === "string") {
    labels = [labels];
  }
  return `CREATE (${slug}${labels.reduce(
    (prev, label) => prev + formatLabel(label),
    "",
  )} ${toNode(props)})`;
};

export const cypherEdge = (
  relationships: string | string[],
  from: string,
  to: string,
  props: any = {},
) => {
  if (typeof relationships === "string") {
    relationships = [relationships];
  }
  return `(${from})-[${relationships.reduce(
    (prev, relationship) => prev + `:${relationship.toUpperCase()}`,
    "",
  )} ${toNode(props)}]->(${to}),`;
};
