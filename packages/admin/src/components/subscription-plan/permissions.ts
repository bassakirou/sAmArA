export const subscriptionPlanPermissionsOptions = [
  { label: 'Tous', value: 'all' },
  { label: 'Publication de la boutique', value: 'shop_publication' },
  { label: 'Publication de produits', value: 'product_publication' },
  { label: 'Accès au chat de négociation de prix', value: 'chat_negotiation' },
  { label: 'Notifications WhatsApp (Vendeur)', value: 'whatsapp_notifications' },
  {
    label: 'Commission plateforme (en pourcentage)',
    value: 'platform_commission',
  },
];

const permissionLabelByValue = new Map(
  subscriptionPlanPermissionsOptions.map(({ value, label }) => [value, label])
);

export function resolveSubscriptionPlanPermissionLabels(
  permissions: string[] | undefined | null,
  options?: { platformCommissionRate?: number | string | null }
) {
  const formattedCommissionRate = (() => {
    const value = options?.platformCommissionRate;
    if (value === null || value === undefined || value === '') return null;
    const normalized =
      typeof value === 'number'
        ? value
        : Number(String(value).trim().replace(',', '.'));
    if (Number.isFinite(normalized)) {
      return normalized.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
    }
    const raw = String(value).trim();
    return raw.length ? raw : null;
  })();

  const resolveLabel = (value: string, label: string) => {
    if (value !== 'platform_commission') return label;
    if (!formattedCommissionRate) return label;
    return `Commission plateforme (${formattedCommissionRate}%)`;
  };

  const raw = Array.isArray(permissions) ? permissions : [];
  const hasAll = raw.includes('all');
  const withoutAll = raw.filter((p) => p !== 'all');

  if (hasAll) {
    return subscriptionPlanPermissionsOptions
      .filter((o) => o.value !== 'all')
      .map((o) => resolveLabel(o.value, o.label));
  }

  const set = new Set(withoutAll);
  const orderedKnown = subscriptionPlanPermissionsOptions
    .filter((o) => o.value !== 'all' && set.has(o.value))
    .map((o) => resolveLabel(o.value, o.label));

  const knownValues = new Set(
    subscriptionPlanPermissionsOptions.map((o) => o.value)
  );
  const unknown = withoutAll
    .filter((p) => !knownValues.has(p))
    .map((p) => permissionLabelByValue.get(p) ?? p);

  return [...orderedKnown, ...unknown];
}
