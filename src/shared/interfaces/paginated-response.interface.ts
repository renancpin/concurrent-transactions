export interface PaginatedResponse<Rows = any> {
  dados: Rows[];
  paginaAtual: number;
  totalDePaginas: number;
  resultadosPorPagina: number;
  totalDeResultados: number;
}
