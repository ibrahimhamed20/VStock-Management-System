export type RootStackParamList = {
    Login: undefined;
    Main: undefined;
    ProductDetail: { productId: string };
    StockAdjust: { productId: string; productName: string };
    LowStock: undefined;
    InvoiceList: undefined;
    InvoiceDetail: { invoiceId: string };
    ClientDetail: { clientId: string };
    AddClient: undefined;
    Scanner: undefined;
    Suppliers: undefined;
    PurchaseList: undefined;
    PurchaseDetail: { purchaseId: string };
};

export type MainTabParamList = {
    Dashboard: undefined;
    Inventory: undefined;
    Sales: { clientId?: string; clientName?: string } | undefined;
    Clients: undefined;
    Profile: undefined;
};
