export type CreatorAccount = {
  name: 'creator';
  type: {
    kind: 'struct';
    fields: [
      {
        name: 'authority';
        type: 'publicKey';
      },
      {
        name: 'username';
        type: 'string';
      },
      {
        name: 'email';
        type: 'string';
      },
      {
        name: 'description';
        type: 'string';
      },
      {
        name: 'numBenefits';
        type: 'u8';
      },
      {
        name: 'bump';
        type: 'u8';
      }
    ];
  };
};
