import { useEffect, useRef, useState, useCallback } from "react";
import { loadGoogleMaps } from "../lib/google-maps";
import "./AddressAutocomplete.css";

export interface StructuredAddress {
    address: string; // street only (e.g. "9 Lahey Street")
    city: string;
    state: string; // 2-letter abbreviation
    zip: string;
}

const EMPTY_ADDRESS: StructuredAddress = { address: "", city: "", state: "", zip: "" };

interface Props {
    value: StructuredAddress;
    onChange: (addr: StructuredAddress) => void;
}

/**
 * Google Places Autocomplete that fills structured address fields.
 *
 * Uses loadGoogleMaps() to dynamically load the API when VITE_GOOGLE_MAPS_API_KEY
 * is set. Falls back to plain text inputs when the API key is not configured.
 */
export default function AddressAutocomplete({ value, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [mapsLoaded, setMapsLoaded] = useState(false);

    // Load Google Maps API
    useEffect(() => {
        loadGoogleMaps().then((loaded) => setMapsLoaded(loaded));
    }, []);

    // Initialize autocomplete when Maps is loaded
    useEffect(() => {
        if (!mapsLoaded || !inputRef.current || autocompleteRef.current) return;

        const ac = new google.maps.places.Autocomplete(inputRef.current, {
            types: ["address"],
            componentRestrictions: { country: "us" },
            fields: ["address_components", "formatted_address"],
        });

        ac.addListener("place_changed", () => {
            const place = ac.getPlace();
            if (!place.address_components) return;

            const get = (type: string, short = false): string => {
                const comp = place.address_components!.find(
                    (c: google.maps.GeocoderAddressComponent) => c.types.includes(type)
                );
                return comp ? (short ? comp.short_name : comp.long_name) : "";
            };

            const streetNumber = get("street_number");
            const route = get("route");
            const streetAddress = [streetNumber, route].filter(Boolean).join(" ");

            const newAddr: StructuredAddress = {
                address: streetAddress,
                city: get("locality") || get("sublocality_level_1") || get("administrative_area_level_2"),
                state: get("administrative_area_level_1", true), // 2-letter
                zip: get("postal_code"),
            };

            onChange(newAddr);

            // Show street-only in the input (Decision #2)
            if (inputRef.current) {
                inputRef.current.value = streetAddress;
            }
        });

        autocompleteRef.current = ac;
    }, [mapsLoaded, onChange]);

    // Sync external value changes to the main input
    useEffect(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
            inputRef.current.value = value.address;
        }
    }, [value.address]);

    const updateField = useCallback(
        (field: keyof StructuredAddress, v: string) => {
            onChange({ ...value, [field]: v });
        },
        [value, onChange]
    );

    return (
        <div className="address-autocomplete">
            <div className="form-group">
                <label>Street Address</label>
                <input
                    ref={inputRef}
                    type="text"
                    defaultValue={value.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Start typing an address..."
                    autoComplete="off"
                />
            </div>
            <div className="address-row">
                <div className="form-group address-city">
                    <label>City</label>
                    <input
                        type="text"
                        value={value.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="City"
                    />
                </div>
                <div className="form-group address-state">
                    <label>State</label>
                    <input
                        type="text"
                        value={value.state}
                        onChange={(e) => updateField("state", e.target.value.toUpperCase().slice(0, 2))}
                        placeholder="CA"
                        maxLength={2}
                    />
                </div>
                <div className="form-group address-zip">
                    <label>Zip</label>
                    <input
                        type="text"
                        value={value.zip}
                        onChange={(e) => updateField("zip", e.target.value)}
                        placeholder="90210"
                        maxLength={10}
                    />
                </div>
            </div>
        </div>
    );
}

export { EMPTY_ADDRESS };
