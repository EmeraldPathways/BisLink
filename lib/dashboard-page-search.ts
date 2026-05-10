type EditSearchParams = {
  edit?: string;
};

export async function resolveEditSearchParam(
  searchParams?: EditSearchParams | Promise<EditSearchParams>,
) {
  const resolved = await searchParams;
  return resolved?.edit;
}
