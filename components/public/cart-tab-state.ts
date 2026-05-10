export function shouldShowCartTab({
  showProducts,
  count,
}: {
  showProducts: boolean;
  count: number;
}) {
  return showProducts && count > 0;
}
