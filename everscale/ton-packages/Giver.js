const GiverContract = {
    abi: {
        "ABI version": 2,
        "header": [
            "pubkey",
            "time",
            "expire"
        ],
        "functions": [
            {
                "name": "sendTransaction",
                "inputs": [
                    {
                        "name": "dest",
                        "type": "address"
                    },
                    {
                        "name": "value",
                        "type": "uint128"
                    },
                    {
                        "name": "bounce",
                        "type": "bool"
                    }
                ],
                "outputs": []
            },
            {
                "name": "getIncome",
                "inputs": [
                    {
                        "name": "sender",
                        "type": "address"
                    }
                ],
                "outputs": [
                    {
                        "name": "balance",
                        "type": "uint128"
                    },
                    {
                        "name": "ts",
                        "type": "uint32[]"
                    },
                    {
                        "name": "values",
                        "type": "uint128[]"
                    }
                ]
            },
            {
                "name": "getOutgoing",
                "inputs": [
                    {
                        "name": "receiver",
                        "type": "address"
                    }
                ],
                "outputs": [
                    {
                        "name": "balance",
                        "type": "uint128"
                    },
                    {
                        "name": "ts",
                        "type": "uint32[]"
                    },
                    {
                        "name": "values",
                        "type": "uint128[]"
                    }
                ]
            },
            {
                "name": "getBalance",
                "inputs": [],
                "outputs": [
                    {
                        "name": "balance",
                        "type": "uint128"
                    }
                ]
            },
            {
                "name": "constructor",
                "inputs": [],
                "outputs": []
            }
        ],
        "data": [],
        "events": []
    },
    tvc: "te6ccgECHwEABOcAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gsdBwQeAQAFAvyNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4dgQIA1xgg+QEB0wABlNP/AwGTAvhC4iD4ZfkQ8qiV0wAB8nri0z8Bjh34QyG5IJ8wIPgjgQPoqIIIG3dAoLnekyD4Y+DyNNgw0x8B+CO88rkNBgEU0x8B2zz4R27yfAgCWCLQ0wP6QDD4aak4ANwhxwAgnzAh1w0f8rwhwAAgkmwh3t/jAgHbPPhHbvJ8FQgCKCCCEGi1Xz+74wIgghB694QwuuMCCwkDsjD4SG7jAPpBldTR0PpA39HbPCPA/446JdDTAfpAMDHIz4cgzo0EAAAAAAAAAAAAAAAAD694QwjPFiPPC38ibyICyx/0ACFvIgLLH/QAyXD7AN5fA+MAf/hnHAoXAmJwcG1vAnBtbwL4RSBukjBw3vhCuvLgZvgAI/hKgQEL9AqKiuIgbxI0IG8QM28RMWwTGxoEUCCCECYnaHG64wIgghAxXvk1uuMCIIIQZeAXIbrjAiCCEGi1Xz+64wITEA4MAiow+Ehu4wD4RvJzcfhm0fgA2zx/+GcNFwCG7UTQINdJwgGOGNP/0z/TAPQE9ATR+Gv4an/4aPhm+GP4Yo4e9AVt+Gpt+GtwAYBA9A7yvdcL//hicPhjcPhmf/ho4gOyMPhIbuMA+kGV1NHQ+kDf0ds8I8D/jjol0NMB+kAwMcjPhyDOjQQAAAAAAAAAAAAAAAAOXgFyGM8WI88LfyJvIgLLH/QAIW8iAssf9ADJcPsA3l8D4wB/+GccDxcCYnBwbW8CcG1vAvhFIG6SMHDe+EK68uBm+AAj+EuBAQv0CoqK4iBvEjQgbxAzbxExbBMbGgNWMPhIbuMA+kGV1NHQ+kDf1w1/ldTR0NN/39cMAJXU0dDSAN/R2zzbPH/4ZxwRFwT++EUgbpIwcN74Qrry4Gb4APgnbxAivPK8VHEgyM+FgMoAc89AzgH6AoBrz0DJc/sAIvhLgQEL9AqKiuL4IyFvElMibxAjyMsfAW8iIaQDWYAg9ENvAm9QM1MibxEmyMt/AW8iIaQDWYAg9ENvAm9RM1RyBKC1f29SMyX4SyTbPBsaGBIAFFmBAQv0QfhrXwYCdDDR2zwhwP+OKiPQ0wH6QDAxyM+HIM6NBAAAAAAAAAAAAAAAAApidocYzxYhzwt/yXD7AN4w4wB/+GcUFwAscPhFIG6SMHDe+EK68uBm+AD4J28QMQRk+Ehu4wD4I/hJ+EqBAQv0CoqK4iBvElMRbxAkyMsfAW8iIaQDWYAg9ENvAm9QMlMRbxEcGxoWBGLbPMjLfwFvIiGkA1mAIPRDbwJvUTJc2zygtX9vUjL4SfhKI9s8WYEBC/RB+GpfA9s8GRkYFwA0+Eb4Q/hCyMv/yz/LAPhKAfQA+EsB9ADJ7VQAMm8jyCNvIgLLH/QAIm8iAssf9AAhzwt/bDEAGHBopvtglWim/mAx3wAWcG1vAnBtbwJwbwMAKtMf9ARZbwIB0x/0BFlvAgHTf9FvAwA27UTQ0//TP9MA9AT0BNH4a/hqf/ho+Gb4Y/hiAQr0pCD0oR4AAA==",
};
module.exports = { GiverContract };
