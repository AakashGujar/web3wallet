/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import nacl from 'tweetnacl';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import bs58 from 'bs58';
import { ethers } from 'ethers';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Grid2X2,
  List,
  Trash2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '../components/ui/label';
import PropTypes from 'prop-types';
import { Buffer } from 'buffer';

WalletGenerator.propTypes = {
  selectedChain: PropTypes.string.isRequired,
  onReset: PropTypes.func.isRequired,
};

const WalletGenerator = ({ selectedChain, onReset }) => {
  const [mnemonicWords, setMnemonicWords] = useState(Array(12).fill(' '));
  const [pathTypes, setPathTypes] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState([]);
  const [visiblePhrases, setVisiblePhrases] = useState([]);
  const [gridView, setGridView] = useState(false);
  const pathTypeNames = {
    501: 'Solana',
    60: 'Ethereum',
  };

  const pathTypeName = pathTypeNames[pathTypes[0]] || '';

  useEffect(() => {
    const storedWallets = localStorage.getItem('wallets');
    const storedMnemonic = localStorage.getItem('mnemonics');
    const storedPathTypes = localStorage.getItem('paths');

    if (storedWallets && storedMnemonic && storedPathTypes) {
      setMnemonicWords(JSON.parse(storedMnemonic));
      setWallets(JSON.parse(storedWallets));
      setPathTypes(JSON.parse(storedPathTypes));
      setVisiblePrivateKeys(JSON.parse(storedWallets).map(() => false));
      setVisiblePhrases(JSON.parse(storedWallets).map(() => false));
    }
  }, []);

  const handleDeleteWallet = (index) => {
    const updatedWallets = wallets.filter((_, i) => i !== index);
    const updatedPathTypes = pathTypes.filter((_, i) => i !== index);

    setWallets(updatedWallets);
    setPathTypes(updatedPathTypes);
    localStorage.setItem('wallets', JSON.stringify(updatedWallets));
    localStorage.setItem('paths', JSON.stringify(updatedPathTypes));
    setVisiblePrivateKeys(visiblePrivateKeys.filter((_, i) => i !== index));
    setVisiblePhrases(visiblePhrases.filter((_, i) => i !== index));
    toast.success('Wallet deleted successfully!');
  };

  const handleClearWallets = () => {
    localStorage.removeItem('wallets');
    localStorage.removeItem('mnemonics');
    localStorage.removeItem('paths');
    setWallets([]);
    setMnemonicWords([]);
    setPathTypes([]);
    setVisiblePrivateKeys([]);
    setVisiblePhrases([]);
    toast.success('All wallets cleared.');
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const togglePrivateKeyVisibility = (index) => {
    setVisiblePrivateKeys(
      visiblePrivateKeys.map((visible, i) => (i === index ? !visible : visible))
    );
  };

  const togglePhraseVisibility = (index) => {
    setVisiblePhrases(
      visiblePhrases.map((visible, i) => (i === index ? !visible : visible))
    );
  };

  const generateWalletFromMnemonic = (pathType, mnemonic, accountIndex) => {
    try {
      const seedBuffer = mnemonicToSeedSync(mnemonic);
      const path = `m/44'/${pathType}'/0'/${accountIndex}'`;
      const { key: derivedSeed } = derivePath(path, seedBuffer.toString('hex'));

      let publicKeyEncoded;
      let privateKeyEncoded;

      if (pathType === '501') {
        // Solana
        const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
        const keypair = Keypair.fromSecretKey(secretKey);

        privateKeyEncoded = bs58.encode(secretKey);
        publicKeyEncoded = keypair.publicKey.toBase58();
      } else if (pathType === '60') {
        // Ethereum
        const privateKey = Buffer.from(derivedSeed).toString('hex');
        privateKeyEncoded = privateKey;

        const wallet = new ethers.Wallet(privateKey);
        publicKeyEncoded = wallet.address;
      } else {
        toast.error('Unsupported path type.');
        return null;
      }

      return {
        publicKey: publicKeyEncoded,
        privateKey: privateKeyEncoded,
        mnemonic,
        path,
      };
    } catch (error) {
      toast.error('Failed to generate wallet. Please try again.');
      return null;
    }
  };

  const handleGenerateWallet = () => {
    let mnemonic = mnemonicInput.trim();

    if (mnemonic) {
      if (!validateMnemonic(mnemonic)) {
        toast.error('Invalid recovery phrase. Please try again.');
        return;
      }
    } else {
      mnemonic = generateMnemonic();
    }

    const words = mnemonic.split(' ');
    setMnemonicWords(words);

    const wallet = generateWalletFromMnemonic(
      pathTypes[0],
      mnemonic,
      wallets.length
    );
    if (wallet) {
      const updatedWallets = [...wallets, wallet];
      setWallets(updatedWallets);
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      localStorage.setItem('mnemonics', JSON.stringify(words));
      localStorage.setItem('paths', JSON.stringify(pathTypes));
      setVisiblePrivateKeys([...visiblePrivateKeys, false]);
      setVisiblePhrases([...visiblePhrases, false]);
      toast.success('Wallet generated successfully!');
    }
  };

  const handleAddWallet = () => {
    if (!mnemonicWords) {
      toast.error('No mnemonic found. Please generate a wallet first.');
      return;
    }

    const wallet = generateWalletFromMnemonic(
      pathTypes[0],
      mnemonicWords.join(' '),
      wallets.length
    );
    if (wallet) {
      const updatedWallets = [...wallets, wallet];
      setWallets(updatedWallets);
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      localStorage.setItem('paths', JSON.stringify(pathTypes)); // Fixed updating pathTypes
      setVisiblePrivateKeys([...visiblePrivateKeys, false]);
      setVisiblePhrases([...visiblePhrases, false]);
      toast.success('Wallet generated successfully!');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {wallets.length === 0 && (
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
        >
          <div className="flex flex-col gap-4">
            {pathTypes.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeInOut',
                }}
                className="flex flex-col items-center justify-center p-4 bg-gray-200 border border-gray-300 rounded-md"
              >
                <p className="text-gray-600 text-center">No path type selected</p>
              </motion.div>
            )}
            {pathTypes.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-gray-800">Generate a new wallet:</p>
                <Button onClick={handleGenerateWallet}>Generate Wallet</Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
      {wallets.length > 0 && (
        <div>
          <Button
            variant="destructive"
            onClick={handleClearWallets}
            className="mb-4"
          >
            Clear All Wallets
          </Button>
          {gridView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wallets.map((wallet, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{wallet.publicKey}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span>Private Key:</span>
                        <Button
                          onClick={() =>
                            togglePrivateKeyVisibility(index)
                          }
                        >
                          {visiblePrivateKeys[index] ? (
                            <EyeOff />
                          ) : (
                            <Eye />
                          )}
                        </Button>
                      </div>
                      {visiblePrivateKeys[index] && (
                        <Input
                          readOnly
                          value={wallet.privateKey}
                          endAdornment={
                            <Button
                              onClick={() =>
                                copyToClipboard(wallet.privateKey)
                              }
                            >
                              <Copy />
                            </Button>
                          }
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <span>Mnemonic:</span>
                        <Button
                          onClick={() =>
                            togglePhraseVisibility(index)
                          }
                        >
                          {visiblePhrases[index] ? (
                            <EyeOff />
                          ) : (
                            <Eye />
                          )}
                        </Button>
                      </div>
                      {visiblePhrases[index] && (
                        <Input
                          readOnly
                          value={wallet.mnemonic}
                          endAdornment={
                            <Button
                              onClick={() =>
                                copyToClipboard(wallet.mnemonic)
                              }
                            >
                              <Copy />
                            </Button>
                          }
                        />
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteWallet(index)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {wallets.map((wallet, index) => (
                <div
                  key={index}
                  className="flex flex-col p-4 border border-gray-300 rounded-md"
                >
                  <div className="flex justify-between">
                    <span>Public Key:</span>
                    <Button
                      onClick={() => copyToClipboard(wallet.publicKey)}
                    >
                      <Copy />
                    </Button>
                  </div>
                  <div className="flex justify-between">
                    <span>Private Key:</span>
                    <Button
                      onClick={() =>
                        togglePrivateKeyVisibility(index)
                      }
                    >
                      {visiblePrivateKeys[index] ? (
                        <EyeOff />
                      ) : (
                        <Eye />
                      )}
                    </Button>
                  </div>
                  {visiblePrivateKeys[index] && (
                    <Input
                      readOnly
                      value={wallet.privateKey}
                      endAdornment={
                        <Button
                          onClick={() =>
                            copyToClipboard(wallet.privateKey)
                          }
                        >
                          <Copy />
                        </Button>
                      }
                    />
                  )}
                  <div className="flex justify-between">
                    <span>Mnemonic:</span>
                    <Button
                      onClick={() => togglePhraseVisibility(index)}
                    >
                      {visiblePhrases[index] ? (
                        <EyeOff />
                      ) : (
                        <Eye />
                      )}
                    </Button>
                  </div>
                  {visiblePhrases[index] && (
                    <Input
                      readOnly
                      value={wallet.mnemonic}
                      endAdornment={
                        <Button
                          onClick={() =>
                            copyToClipboard(wallet.mnemonic)
                          }
                        >
                          <Copy />
                        </Button>
                      }
                    />
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteWallet(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button
            onClick={() => setGridView(!gridView)}
            className="mt-4"
          >
            {gridView ? <List /> : <Grid2X2 />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletGenerator;
