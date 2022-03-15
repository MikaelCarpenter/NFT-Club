
// benefit box component
const BenefitBox = () => {
  return (
    <div className="box-border my-4 h-28 w-3/5 p-2  border-2 border-black">
      <div>
        <p className= "text-black top-0 left-0 font-medium">
          Benefit
        </p>
      </div>
      <div className="flex flex col items-center justify-center">
        <p className="text-black text-center">
          lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam quos quaerat, doloremque,
        </p>
      </div>

    </div>
  );
};

// creator description component
const CreatorDescription = () => {
  return (
    <div className="w-96">
      <p className="text-base font-light leading-relaxed mt-0 mb-4 text-center text-black">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Pellentesque maximus, ipsum eu dignissim consectetur, nisi nunc
        efficitur nunc, eget efficitur nunc nisi eu nunc.
      </p>
    </div>
  );
};

// name header component
const NameHeader = () => {
  return (
    <div className="text-center">
      <h1 className="font-medium leading-tight text-4xl mt-0 mb-2 text-black">NAME</h1>
    </div>
  );
};


const creatorLandingPage = () => {
  return (
    <div>
      <NameHeader />
      <div className= "flex flex-col items-center">
        <CreatorDescription />
      </div>
      <div className= "flex items-center flex-col">
        <BenefitBox />
        <BenefitBox />
        <BenefitBox />
      </div>
    </div>

  );
};

export default creatorLandingPage;
