import { NextPage } from "next";
import NameHeader from "./components/NameHeader";
import CreatorDescription from "./components/CreatorDescription";
import BenefitBox from "./components/BenefitBox";

const creatorLandingPage: NextPage = () => {
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
