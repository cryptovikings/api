/**
 * Intermediate data format containing all the information required to generate Viking Database Data + Viking Images
 *
 * Derived directly from Viking Contract Data
 *
 * Contains information on:
 *     - the Viking's Number (direct from Contract; NFT ID)
 *     - the Viking's Name (direct from Contract)
 *     - Part Type Names (derived from Contract Data Style numbers)
 *     - Item/Clothing Conditions (derived from Contract Data Statistics)
 *     - Statistics (direct from Contract)
 *     - File Paths for each part
 *     - the Viking's Image URLs
 */
export interface VikingSpecification {
    number: number;
    name: string;
    image: string;
    texture: string;
    conditions: {
        boots: ClothesCondition;
        bottoms: ClothesCondition;
        helmet: ItemCondition;
        shield: ItemCondition;
        weapon: ItemCondition;
    };
    stats: {
        attack: number;
        defence: number;
        intelligence: number;
        speed: number;
        stamina: number;
    };
    styles: {
        beard: string;
        body: string;
        boots: string;
        bottoms: string;
        face: string;
        helmet: string;
        shield: string;
        top: string;
        weapon: string;
    };
    filePaths: {
        beard: string;
        body: string;
        face: string;
        top: string;
        boots: string;
        bottoms: string;
        helmet?: string;
        shield?: string;
        weapon?: string;
    };
}
