import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { api } from '../services/api';

interface ITransaction {
  id: number;
  title: string;
  amount: number;
  valueFormatted: string;
  type: string;
  category: string;
  createdAt: string;
  dateFormatted: string;
}

type TransactionInput = Omit<
  ITransaction,
  'id' | 'valueFormatted' | 'createdAt' | 'dateFormatted'
>;

interface ITransactionsProviderProps {
  children: ReactNode;
}

interface ITransactionsContext {
  transactions: ITransaction[];
  createTransaction: (transaction: TransactionInput) => Promise<void>;
}

const TransactionsContext = createContext<ITransactionsContext>(
  {} as ITransactionsContext,
);

export function TransactionsProvider({ children }: ITransactionsProviderProps) {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  useEffect(() => {
    api.get('transactions').then(response => {
      const currencyFormat = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      const dateFormat = new Intl.DateTimeFormat('pt-BR');

      const transactionsList = response.data.transactions.map(
        (transaction: ITransaction) => ({
          ...transaction,
          valueFormatted: currencyFormat.format(transaction.amount),
          dateFormatted: dateFormat.format(new Date(transaction.createdAt)),
        }),
      );

      setTransactions(transactionsList);
    });
  }, []);

  async function createTransaction(transactionInput: TransactionInput) {
    const response = await api.post('/transactions', {
      ...transactionInput,
      createdAt: new Date(),
    });
    const { transaction } = response.data;

    const currencyFormat = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    const dateFormat = new Intl.DateTimeFormat('pt-BR');

    const newTransaction = {
      ...transaction,
      valueFormatted: currencyFormat.format(transaction.amount),
      dateFormatted: dateFormat.format(new Date(transaction.createdAt)),
    };

    setTransactions([...transactions, newTransaction]);
  }

  return (
    <TransactionsContext.Provider value={{ transactions, createTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);

  return context;
}
