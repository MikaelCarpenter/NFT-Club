export type Benefit = {
  name: 'benefit';
  type: {
    kind: 'struct';
    fields: [
      {
        name: 'authority';
        type: 'publicKey';
      },
      {
        name: 'name';
        type: 'string';
      },
      {
        name: 'description';
        type: 'string';
      },
      {
        name: 'bump';
        type: 'u8';
      }
    ];
  };
};
