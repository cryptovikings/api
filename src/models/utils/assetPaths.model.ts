/**
 * Model representing the collection of Asset File Paths inferred based on Viking Contract Data and used by the ImageHelper
 */
export interface AssetPaths {
    beard: string;
    body: string;
    top: string;
    face: string;
    boots?: string;
    bottoms?: string;
    helmet?: string;
    // unused for now (no assets)
    // shield?: string;
    // weapon?: string;
}
