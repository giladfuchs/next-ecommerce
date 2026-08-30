import { OrderDashboardClient } from "./order-dashboard-client";

import appConfig from "@/lib/core/config";
import { IntlProvider } from "@/lib/providers/intl";

export const OrderDashboard = () => (
  <IntlProvider>
    <OrderDashboardClient
      currency={appConfig.LOCAL.currency}
      direction={appConfig.LOCAL.dir}
      locale={appConfig.LOCAL.locale}
    />
  </IntlProvider>
);
