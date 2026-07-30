export type TxMessage = {
  id: string;
  transactionId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  textbookId: string;
  buyerId: string;
  sellerId?: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
};

export const transactions: Transaction[] = [];
export const txMessages: TxMessage[] = [];
// map textbookId -> seller userId for demo claim
export const sellersClaim: Record<string, string> = {};
