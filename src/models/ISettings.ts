export interface ISettings {
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
}
