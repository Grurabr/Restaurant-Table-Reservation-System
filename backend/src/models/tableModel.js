class TableModel {
    constructor(table) {
      this.id_table = Number(table.id_table);
      this.id_restaurant = Number(table.id_restaurant);
      this.number = table.number;
      this.capacity = Number(table.capacity);
      this.neighboring_tables = table.neighboring_tables;
      this.is_deleted = Number(table.is_deleted);
    }
}
  
module.exports = TableModel;