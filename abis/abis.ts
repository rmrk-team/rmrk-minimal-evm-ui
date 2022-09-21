import RMRKMultiResourceImpl from './RMRKMultiResourceImpl.json';
import RMRKMultiResourceFactory from './RMRKMultiResourceFactory.json';
import RMRKNestingFactory from './RMRKNestingFactory.json';
import RMRKEquippableFactory from './RMRKEquippableFactory.json';
import RMRKEquippableImpl from './RMRKEquippableImpl.json';
import RMRKNestingMultiResourceImpl from './RMRKNestingMultiResourceImpl.json';
import RMRKMarketplace from './RMRKMarketplace.json';
import ERC20 from './ERC20.json';
import RMRKRegistry from './RMRKRegistry.json';

const abis = {
  multiResourceAbi: RMRKMultiResourceImpl.abi,
  multiResourceFactoryAbi: RMRKMultiResourceFactory.abi,
  nestingFactoryAbi: RMRKNestingFactory.abi,
  equippableFactoryAbi: RMRKEquippableFactory.abi,
  equippableImplAbi: RMRKEquippableImpl.abi,
  nestingImplAbi: RMRKNestingMultiResourceImpl.abi,
  marketplaceAbi: RMRKMarketplace.abi,
  tokenContractAbi: ERC20.abi,
  registryAbi: RMRKRegistry.abi,
};

export default abis;
