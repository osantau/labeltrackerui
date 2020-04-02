  export  class Attributes {
      total: number;
      errors: number;
      repeats: number;
      viables: number;
  }

  export class Lot {
      id: number;
      attributes: Attributes;
      lotno: string;
      running: string;
      created: Date;
      updated: Date;
      started: Date;
      ended: Date;
  }
