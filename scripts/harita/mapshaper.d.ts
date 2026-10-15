declare module "mapshaper" {
  const mapshaper: {
    applyCommands(komut: string, girdi: Record<string, string>): Promise<Record<string, string | Uint8Array>>;
  };
  export default mapshaper;
}
