import { useState} from 'react';
import BenefitInput from './BenefitInput';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState([]);

  type InputDict = { [index: string]: Function }
  const inputDict: InputDict = {
    'username': setUsername,
    'email': setEmail,
    'description': setDescription
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>, inputField: string) => {
    inputDict[inputField](event.target.value);
  }

  const addBenefitInput = () => {
    console.log("Adding Benefit Input");
  }

  const createAccount = () => {
    console.log('Making RPC Call...');
    console.log(`Creating Account with username: ${username}, email: ${email}, description: ${description}`);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-bg-primary">
      <h1 className="mt-16 text-4xl">Sign Up</h1>
      <div className="flex flex-col items-center justify-start w-1/4 h-3/4">
        <div className="w-full py-8">
          <input
            className="w-full px-2 rounded text-text-primary outline-0"
            placeholder="Username"
            onChange={(e) => handleInput(e, 'username')}
          />
        </div>
        <div className="w-full py-8">
          <input
            className="w-full px-2 rounded text-text-primary outline-0"
            placeholder="Email"
            onChange={(e) => handleInput(e, 'email')}
          />
        </div>
        <div className="w-full py-8 h-1/4">
          <textarea
            className="w-full h-full px-2 rounded resize-none text-text-primary outline-0"
            placeholder="Account description"
            onChange={(e) => handleInput(e, 'description')}
          />
        </div>

        <BenefitInput />
        <button
          className="h-12 p-2 m-4 bg-white rounded-3xl text-text-primary"
          onClick={() => addBenefitInput()}
        >
          Add Benefit
        </button>
      </div>
      <button
        className="h-12 p-2 m-4 bg-white rounded-3xl text-text-primary"
        onClick={() => createAccount()}
      >
        Create Account
      </button>
    </div>
  );
};

export default SignUp;
