export interface IUnlockBlock {
    /**
     * The Type.
     */
    type: number;

     /**
     * The referenceIndex.
     */
    referenceIndex: number;

    /**
     * The publicKey.
     */
    publicKey: Buffer;

    /**
     * The signature.
     */
    signature: Buffer;
}