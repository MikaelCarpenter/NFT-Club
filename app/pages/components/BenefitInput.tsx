import { useState} from 'react';

const BenefitInput = () => {
  const [description, setDescription] = useState('');

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>, inputField: string) => {
    setDescription(event.target.value);
    console.log(description);
  }


  return (
    <div className="w-full py-8 h-1/4">
      <textarea
        className="w-full h-full px-2 rounded resize-none text-text-primary outline-0"
        placeholder="Benefit description"
        onChange={(e) => handleInput(e, 'description')}
      />
    </div>
  );
};

export default BenefitInput;
