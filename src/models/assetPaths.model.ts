/**
 * Model representing the collection of Asset File Paths inferred based on Viking Contract Data and used by the ImageHelper
 */
export interface AssetPaths {
    beard: string;
    body: string;
    boots?: string;
    bottoms?: string;
    face: string;
    helmet?: string;
    // unused for now (no assets)
    // shield?: string;
    // top: string;
    // weapon?: string;
}
