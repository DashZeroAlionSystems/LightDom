# Smart Contract Tests

This directory contains comprehensive tests for all LightDom smart contracts.

## Test Structure

```
test/contracts/
├── LightDomToken.test.ts           # LightDom token tests
├── OptimizationRegistry.test.ts    # Optimization registry tests
├── VirtualLandNFT.test.ts          # Virtual Land NFT tests
├── ProofOfOptimization.test.ts     # Proof of optimization tests
└── README.md                       # This file
```

## Running Tests

### Run All Tests
```bash
npx hardhat test
```

### Run Specific Test File
```bash
npx hardhat test test/contracts/LightDomToken.test.ts
```

### Run with Coverage
```bash
npx hardhat coverage
```

### Run with Gas Reporter
```bash
REPORT_GAS=true npx hardhat test
```

## Test Categories

### 1. Unit Tests
Test individual contract functions in isolation.

### 2. Integration Tests
Test interactions between multiple contracts.

### 3. Security Tests
Test security features and attack vectors.

### 4. Gas Optimization Tests
Measure and optimize gas usage.

## Writing Tests

### Test Template

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ContractName", function () {
  let contract: ContractType;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const Contract = await ethers.getContractFactory("ContractName");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  describe("Feature", function () {
    it("Should do something", async function () {
      // Test logic
      expect(await contract.someFunction()).to.equal(expectedValue);
    });
  });
});
```

### Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear test descriptions
3. **Edge Cases**: Test boundary conditions
4. **Revert Scenarios**: Test failure cases
5. **Events**: Verify events are emitted
6. **Gas Efficiency**: Monitor gas usage

## Coverage Goals

- **Statements**: > 95%
- **Branches**: > 90%
- **Functions**: > 95%
- **Lines**: > 95%

## Test Checklist

For each contract, ensure tests cover:

- [ ] Deployment and initialization
- [ ] Access control (owner/admin functions)
- [ ] Core functionality (happy path)
- [ ] Edge cases and boundaries
- [ ] Error conditions and reverts
- [ ] Event emissions
- [ ] State transitions
- [ ] Integration with other contracts
- [ ] Security considerations
- [ ] Gas optimization

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment checks

## Troubleshooting

### Tests Failing

1. Check contract compilation:
   ```bash
   npx hardhat compile
   ```

2. Check network configuration:
   ```bash
   npx hardhat console
   ```

3. Clear cache and recompile:
   ```bash
   npx hardhat clean
   npx hardhat compile
   ```

### Slow Tests

- Use `beforeEach` for setup
- Mock external calls
- Use snapshots for complex state

## Resources

- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)
- [Chai Assertions](https://www.chaijs.com/api/)
- [Ethers.js Testing](https://docs.ethers.org/)
- [OpenZeppelin Test Helpers](https://docs.openzeppelin.com/test-helpers/)
