import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { triggerToast } from '../utils/toastUtils';
import {
  generateOrValidateSeedPhrase,
  createWallet,
} from '../utils/walletUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SeedPhraseDisplay = ({
  seedPhrase,
  isVisible,
  onToggleVisibility,
  onCopy,
}) => (
  <Card className="relative overflow-hidden mb-6">
    <CardHeader className="relative">
      <CardTitle className="text-3xl">Your Secret Phrase</CardTitle>
      <CardDescription className="flex items-center space-x-2">
        <p>They are essential for wallet access and recovery.</p>
        <button
          onClick={onToggleVisibility}
          className="absolute top-0 right-0 p-2"
        >
          {isVisible ? (
            <EyeOff className="text-gray-400 w-6" />
          ) : (
            <Eye className="text-gray-400 w-6" />
          )}
        </button>
      </CardDescription>
    </CardHeader>
    <CardContent className="relative">
      <div
        className={`grid grid-cols-4 gap-4 ${isVisible ? '' : 'backdrop-blur-md'}`}
      >
        {seedPhrase.split(' ').map((word, index) => (
          <div
            key={index}
            className={`p-4 border rounded bg-gray-100 bg-opacity-5 flex items-center justify-center
            text-lg font-medium cursor-pointer transition-opacity duration-300
            ${isVisible ? 'opacity-100' : 'opacity-50'}`}
            onClick={() => onCopy(word)}
            title="Click to copy"
          >
            <span className={`${isVisible ? '' : 'blur-sm'}`}>{word}</span>
          </div>
        ))}
      </div>
    </CardContent>
    <CardFooter className="flex items-center justify-start space-x-2">
      <Copy className="text-gray-400 w-4" />
      <p
        className="text-gray-400 text-base cursor-pointer"
        onClick={() => onCopy(seedPhrase)}
      >
        Click anywhere to copy
      </p>
    </CardFooter>
  </Card>
);

SeedPhraseDisplay.propTypes = {
  seedPhrase: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onToggleVisibility: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
};

const WalletList = ({ wallets, selectedChain, isVisible }) => (
  <>
    <CardTitle className="mb-6">
      {selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)} Wallets
    </CardTitle>

    {wallets.map((wallet, index) => (
      <>
        <Card className="mb-5">
          <CardHeader>
            <CardTitle className="mb-5">Wallet {index + 1}</CardTitle>
            <CardDescription className="text-base">
              Public Key: {wallet.publicKey || wallet.address}
            </CardDescription>
            <CardDescription className="text-base">Private Key: {wallet.privateKey}</CardDescription>
          </CardHeader>
        </Card>

        <p className="font-semibold"></p>
      </>
    ))}
  </>
);

WalletList.propTypes = {
  wallets: PropTypes.array.isRequired,
  selectedChain: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

const Wallet = ({ selectedChain, onReset }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [inputSeed, setInputSeed] = useState('');
  const [wallets, setWallets] = useState([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('walletData');
    if (storedData) {
      const { seedPhrase: storedSeedPhrase, wallets: storedWallets } =
        JSON.parse(storedData);
      setSeedPhrase(storedSeedPhrase);
      setWallets(storedWallets);
    }
  }, []);

  useEffect(() => {
    if (seedPhrase || wallets.length > 0) {
      localStorage.setItem(
        'walletData',
        JSON.stringify({ seedPhrase, wallets })
      );
    }
  }, [seedPhrase, wallets]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      triggerToast('Copied successfully! Keep this information secure.', 'success');
    });
  }, []);

  const handleGenerate = useCallback(() => {
    try {
      const mnemonic = generateOrValidateSeedPhrase(inputSeed);
      setSeedPhrase(mnemonic);
      setWallets([]);
      triggerToast('New seed phrase generated. Remember to keep it safe!', 'success');
    } catch (error) {
      triggerToast(error.message, 'error');
      triggerToast(`Error: ${error.message}. Please try again.`, 'error');
    }
  }, [inputSeed]);

  const handleAddWallet = useCallback(async () => {
    if (!seedPhrase) {
      triggerToast('Please generate or enter a seed phrase first.', 'warning');
      return;
    }

    try {
      const newWallet = await createWallet(
        seedPhrase,
        selectedChain,
        wallets.length
      );
      setWallets((prevWallets) => [...prevWallets, newWallet]);
      triggerToast(`New ${selectedChain} wallet created successfully!`, 'success')
    } catch (error) {
      triggerToast(`Failed to create wallet: ${error.message}`, 'error');
    }
  }, [seedPhrase, selectedChain, wallets.length]);

  const handleClearWallets = useCallback(() => {
    setWallets([]);
    setSeedPhrase('');
    localStorage.removeItem('walletData');
     triggerToast('All wallet data has been cleared. Your information is no longer stored.', 'info');
    setIsAlertOpen(false);
  }, []);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-5xl">
            {selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)}{' '}
            Wallet
          </h1>
          <h3 className="mt-2 scroll-m-20 text-2xl tracking-tight">
            Generate or recover your wallet
          </h3>
        </div>
        <Button onClick={onReset}>Change Blockchain</Button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Enter your secret phrase here (or leave blank to create a new one)"
          value={inputSeed}
          onChange={(e) => setInputSeed(e.target.value)}
        />
        <Button className="px-12" onClick={handleGenerate}>
          Generate
        </Button>
      </div>

      {seedPhrase && (
        <SeedPhraseDisplay
          seedPhrase={seedPhrase}
          isVisible={isVisible}
          onToggleVisibility={() => setIsVisible(!isVisible)}
          onCopy={copyToClipboard}
        />
      )}

      {seedPhrase && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Public/Private Keypair</h2>
            <div className="space-x-2">
              <Button onClick={handleAddWallet}>
                <Plus className="mr-2 h-4 w-4" /> Add Wallet
              </Button>
              <Button variant="outline" onClick={() => setIsAlertOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear Wallets
              </Button>
            </div>
          </div>

          {wallets.length > 0 && (
            <WalletList
              wallets={wallets}
              selectedChain={selectedChain}
              isVisible={isVisible}
            />
          )}
        </div>
      )}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your wallets and seed phrase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearWallets}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

Wallet.propTypes = {
  selectedChain: PropTypes.string.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default Wallet;
