export interface ISettings {
    /**
     * API Central Registry Endpoint.
     */
    apiRegistryEndpoint: string;
    
    /**
     * API Endpoint.
     */
    apiEndpoint: string;

    /**
     * API Endpoint username.
     */
    user?: string;

    /**
     * API Endpoint password.
     */
    password?: string;

    /**
     * Access Mana Pledge ID.
     */
    accessManaPledgeID: string;

    /**
     * Access Mana Pledge ID.
     */
    consensusManaPledgeID: string;

    /**
     * Grade of Finality Confirmation threshold
     */
    gofConfThreshold: number;
}
