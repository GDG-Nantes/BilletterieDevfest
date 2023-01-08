export interface CustomOrder {
    Entreprise: string;
    Pays: string;
    "Nom du responsable communication": string;
    "Mail du responsable communication": string;
    "Nom contact service comptabilité": string;
    "Mail du service comptabilité": string;
    "Téléphone": string;
    Adresse: string;
    "Code postal": string;
    Ville: string;
}

export interface Attendee {
    id: string;
    ext_id: string;
    barcode: string;
    used: string;
    lane: string;
    used_date: string;
    email: string;
    firstname: string;
    name: string;
    ticket: string;
    category: string;
    ticket_id: string;
    price: string;
    seating_location: string;
    last_update: string;
    reduction_code: string;
    authorization_code: string;
    pass: string;
    disabled: string;
    product_management: string;
    product_download: string;
    order_id: string;
    order_ext_id: string;
    order_firstname: string;
    order_name: string;
    order_email: string;
    order_date: string;
    order_paid: string;
    order_payment_type: string;
    order_origin: string;
    order_price: string;
    order_session: string;
    session_start: string;
    order_accreditation: string;
    order_management: string;
    order_language: string;
    custom_order: CustomOrder;
}

