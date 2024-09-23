import { useDispatch, useSelector } from 'react-redux';
import { setChain, resetChain } from '../redux/chainSlice';
import { Button } from '../components/ui/button';
import Wallet from '../pages/Wallet';
import { useEffect } from 'react';
import { triggerToast } from '../utils/toastUtils';

const Hero = () => {
  const dispatch = useDispatch();
  const selectedChain = useSelector((state) => state.chain.selectedChain);
  
  useEffect(() => {
    if (selectedChain) {
      triggerToast(`${selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)} wallet activated. Ready to manage your digital assets!`, 'success');
    }
  }, [selectedChain]);

  const handleChainSelection = (chain) => {
    dispatch(setChain(chain));
    triggerToast(`Initializing ${chain} wallet. Please wait...`, 'info');
  };

  const handleReset = () => {
    dispatch(resetChain());
    triggerToast('Wallet reset. Choose a blockchain to start again.', 'info');
  };

  return (
    <main className="mt-20 w-full">
      {!selectedChain ? (
        <>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-5xl">
            Simplified Web-Wallet Experience.
          </h1>
          <h3 className="mt-2 scroll-m-20 text-2xl font-semibold tracking-tight">
            Choose Your Blockchain to Get Started
          </h3>
          <div className="mt-9 flex gap-3">
            <Button className="px-8" onClick={() => handleChainSelection('solana')}>Solana</Button>
            <Button className="px-8" onClick={() => handleChainSelection('ethereum')}>Ethereum</Button>
          </div>
        </>
      ) : (
        <Wallet selectedChain={selectedChain} onReset={handleReset} />
      )}
    </main>
  );
};

export default Hero;