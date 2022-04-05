module.exports = {TokenRootContract:{abi:{"ABI version":2,"version":"2.2","header":["time","expire"],"functions":[{"name":"constructor","inputs":[{"name":"owner","type":"address"},{"name":"addrTransferTokenProxy","type":"address"}],"outputs":[]},{"name":"setConfiguration","inputs":[{"name":"addrTransferTokenProxy","type":"address"}],"outputs":[]},{"name":"transferToken","inputs":[{"name":"gasTo","type":"address"},{"name":"addrRecipient","type":"address"},{"name":"amount","type":"uint128"}],"outputs":[]},{"name":"burnToken","inputs":[{"name":"amount","type":"uint128"},{"name":"payload","type":"cell"}],"outputs":[]},{"name":"getInfo","inputs":[],"outputs":[{"name":"owner","type":"address"},{"name":"addrTransferTokenProxy","type":"address"},{"components":[{"name":"sender_msg","type":"address"},{"name":"addrRecipient","type":"address"},{"name":"amount","type":"uint128"}],"name":"_transferCallbacks","type":"map(uint128,tuple)"}]}],"data":[],"events":[],"fields":[{"name":"_pubkey","type":"uint256"},{"name":"_timestamp","type":"uint64"},{"name":"_constructorFlag","type":"bool"},{"name":"_owner","type":"address"},{"name":"_addrTransferTokenProxy","type":"address"},{"name":"_idCallback","type":"uint128"},{"components":[{"name":"sender_msg","type":"address"},{"name":"addrRecipient","type":"address"},{"name":"amount","type":"uint128"}],"name":"transferCallbacks","type":"map(uint128,tuple)"}]},tvc:"te6ccgECHAEAA2QAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gsZBQQbA5rtRNDXScMB+GaJ+Gkh2zzTAAGfgQIA1xgg+QFY+EL5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPA4MBgNS7UTQ10nDAfhmItDTA/pAMPhpqTgA3CHHAOMCIdcNH/K8IeMDAds88jwYGAYCKCCCEEn6fN+74wIgghBUTXw1uuMCCgcDRDD4RvLgTPhCbuMAIZPU0dDe+kDU0dD6QNN/0ds8MNs88gAXCBIBgvhJ+EvHBfLgZPgnbxBopv5gobV/cvsCIllvA/hM+E1Y2zzJWYEAgPQX+G34TKS1f/hsyM+FiM6Ab89AyYEAgPsACQAWbyMCyM5ZyM7Lf80EUCCCEB+oBYO64wIgghAi9aRguuMCIIIQN+MbN7rjAiCCEEn6fN+64wIUEQ8LAkYw+EJu4wD4RvJzIZPU0dDe+kDU0dD6QNH4AAH4avhr2zzyAAwSAhbtRNDXScIBjoDjDQ0XAUBw7UTQ9AWJIHBt+G34bPhr+GqAQPQO8r3XC//4YnD4Yw4AQ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABADLDD4RvLgTPhCbuMA03/U0ds8MNs88gAXEBIAiGim/mCCEFloLwC+8uBk+CdvEGim/mChtX9y+wIB+EvIz4WIzo0EgAAAAAAAAAAAAAAAAAA0ixDSwM8Wy3/MyYEAgPsAAzYw+Eby4Ez4Qm7jACGT1NHQ3vpA0ds8MNs88gAXExIAQPhN+Ez4S/hK+EP4QsjL/8s/z4POVSDIzst/9ADNye1UADb4SfhKxwXy4GT4a/hJyM+FiM6Ab89AyYBA+wADfjD4RvLgTPhCbuMA0ds8I44mJdDTAfpAMDHIz4cgznHPC2FeIMjPkn6gFg7OWcjO9ADNzclw+wCSXwPi4wDyABcWFQAo7UTQ0//TPzH4Q1jIy//LP87J7VQADPhK+Ev4TQBE7UTQ0//TP9MAMfpA1NHQ+kDTf/QE0fht+Gz4a/hq+GP4YgAK+Eby4EwCCvSkIPShGxoAFHNvbCAwLjU3LjMAAA==",code:"te6ccgECGQEAAzcABCSK7VMg4wMgwP/jAiDA/uMC8gsWAgEYA5rtRNDXScMB+GaJ+Gkh2zzTAAGfgQIA1xgg+QFY+EL5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPAsJAwNS7UTQ10nDAfhmItDTA/pAMPhpqTgA3CHHAOMCIdcNH/K8IeMDAds88jwVFQMCKCCCEEn6fN+74wIgghBUTXw1uuMCBwQDRDD4RvLgTPhCbuMAIZPU0dDe+kDU0dD6QNN/0ds8MNs88gAUBQ8BgvhJ+EvHBfLgZPgnbxBopv5gobV/cvsCIllvA/hM+E1Y2zzJWYEAgPQX+G34TKS1f/hsyM+FiM6Ab89AyYEAgPsABgAWbyMCyM5ZyM7Lf80EUCCCEB+oBYO64wIgghAi9aRguuMCIIIQN+MbN7rjAiCCEEn6fN+64wIRDgwIAkYw+EJu4wD4RvJzIZPU0dDe+kDU0dD6QNH4AAH4avhr2zzyAAkPAhbtRNDXScIBjoDjDQoUAUBw7UTQ9AWJIHBt+G34bPhr+GqAQPQO8r3XC//4YnD4YwsAQ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABADLDD4RvLgTPhCbuMA03/U0ds8MNs88gAUDQ8AiGim/mCCEFloLwC+8uBk+CdvEGim/mChtX9y+wIB+EvIz4WIzo0EgAAAAAAAAAAAAAAAAAA0ixDSwM8Wy3/MyYEAgPsAAzYw+Eby4Ez4Qm7jACGT1NHQ3vpA0ds8MNs88gAUEA8AQPhN+Ez4S/hK+EP4QsjL/8s/z4POVSDIzst/9ADNye1UADb4SfhKxwXy4GT4a/hJyM+FiM6Ab89AyYBA+wADfjD4RvLgTPhCbuMA0ds8I44mJdDTAfpAMDHIz4cgznHPC2FeIMjPkn6gFg7OWcjO9ADNzclw+wCSXwPi4wDyABQTEgAo7UTQ0//TPzH4Q1jIy//LP87J7VQADPhK+Ev4TQBE7UTQ0//TP9MAMfpA1NHQ+kDTf/QE0fht+Gz4a/hq+GP4YgAK+Eby4EwCCvSkIPShGBcAFHNvbCAwLjU3LjMAAA=="}};