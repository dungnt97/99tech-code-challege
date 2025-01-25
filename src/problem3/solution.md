# Code Analysis and Improvements

## Current Issues

### 1. Type Safety Issues

- `blockchain` parameter in `getPriority` is typed as `any`, defeating TypeScript's benefits
- Missing interface for balance object that includes `blockchain` property
- Inconsistent usage between `WalletBalance` and `FormattedWalletBalance`

### 2. Logic Errors

- Filter condition in `sortedBalances` is problematic:

  ```typescript
  balances.filter((balance: WalletBalance) => {
    const balancePriority = getPriority(balance.blockchain);
    if (lhsPriority > -99) {
      // lhsPriority is undefined
      if (balance.amount <= 0) {
        return true;
      }
    }
    return false;
  });
  ```

  - Uses undefined variable `lhsPriority` instead of `balancePriority`
  - Inverted logic: keeps balances with amount <= 0
  - Returns false for all other cases, effectively filtering out most balances

### 3. Performance Issues

- `prices` is in the dependency array of `useMemo` but not used in the calculation
- `sortedBalances.map()` is called twice (once for formatting, once for rendering)
- `getPriority` is called multiple times for the same blockchain in the sort function

### 4. React Best Practices Violations

- Using array index as key prop (anti-pattern in React)
- `Props` interface extends `BoxProps` but doesn't add any properties
- `children` prop is destructured but never used

## Solution

```typescript
interface Blockchain {
  Osmosis: "Osmosis";
  Ethereum: "Ethereum";
  Arbitrum: "Arbitrum";
  Zilliqa: "Zilliqa";
  Neo: "Neo";
}

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: keyof Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

const BLOCKCHAIN_PRIORITY: Record<keyof Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

const getPriority = (blockchain: keyof Blockchain): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? -99;

interface WalletPageProps extends BoxProps {}

const WalletPage: React.FC<WalletPageProps> = ({ ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      })
      .map(
        (balance: WalletBalance): FormattedWalletBalance => ({
          ...balance,
          formatted: balance.amount.toFixed(),
          usdValue: prices[balance.currency] * balance.amount,
        })
      );
  }, [balances, prices]);

  return (
    <div {...rest}>
      {formattedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};
```

## Explanation of Improvements

### 1. Type Safety

- Added `Blockchain` interface to properly define supported blockchain types
- Used `keyof Blockchain` instead of `any`
- Clearly defined interfaces for `WalletBalance` and `FormattedWalletBalance`

### 2. Performance

- Combined mapping operations into one within `useMemo`
- Cached results with proper dependencies
- Simplified sort comparison logic

### 3. Code Structure

- Moved `getPriority` logic to an object lookup
- Combined filter, sort, and format into a single operation
- Fixed filter logic to keep only valid balances with positive amounts

### 4. Maintainability

- Added type safety for blockchain values
- Simplified priority lookup
- Made code more readable and understandable

### 5. React Best Practices

- Used combination of blockchain and currency as unique key
- Removed unused props
- Moved constants outside component
