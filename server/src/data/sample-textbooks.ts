export type Textbook = {
  id: string;
  title: string;
  price: number;
  saleFormat: "FIXED_PRICE" | "AUCTION";
  condition: "LIKE_NEW" | "PENCIL_WRITING" | "MARKER" | "DAMAGED";
  facultyName: string;
  lectureName?: string;
  professorName?: string;
  mainImageUrl?: string;
  createdAt: string;
};

export const sampleTextbooks: Textbook[] = [
  {
    id: "tb1",
    title: "ミクロ経済学 入門",
    price: 2200,
    saleFormat: "FIXED_PRICE",
    condition: "LIKE_NEW",
    facultyName: "経済学部",
    lectureName: "ミクロ経済学I",
    professorName: "田中教授",
    mainImageUrl: "https://via.placeholder.com/400x560.png?text=Microecon",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tb2",
    title: "線形代数（第3版）",
    price: 1800,
    saleFormat: "FIXED_PRICE",
    condition: "PENCIL_WRITING",
    facultyName: "理工学部",
    lectureName: "線形代数",
    professorName: "鈴木教授",
    mainImageUrl: "https://via.placeholder.com/400x560.png?text=Linear+Algebra",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "tb3",
    title: "統計学基礎",
    price: 1500,
    saleFormat: "AUCTION",
    condition: "MARKER",
    facultyName: "商学部",
    lectureName: "統計学入門",
    professorName: "佐藤教授",
    mainImageUrl: "https://via.placeholder.com/400x560.png?text=Statistics",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];
