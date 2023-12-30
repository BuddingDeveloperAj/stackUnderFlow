"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

interface Props {
  imgSrc: string;
  route: string;
  iconPosition: string;
  placeholder: string;
  otherClasses?: string;
}

const LocationSearchbar = ({
  imgSrc,
  route,
  iconPosition,
  placeholder,
  otherClasses,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState();
  const query = searchParams.get("location");
  const [search, setSearch] = useState(query || "");

  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "location",
          value: search,
        });
        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === route) {
          const newUrl = removeKeysFromQuery({
            params: searchParams.toString(),
            keys: ["location"],
          });
          router.push(newUrl, { scroll: false });
        }
      }

      return () => clearTimeout(debouncedSearch);
    }, 500);
  }, [search, route, pathname, router, searchParams, query]);

  const fetchApiData = async ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
    );

    const data = await res.json();
    console.log(data);
    for (const location of data.results) {
      const country = location.address_components.find((x: any) =>
        x.types.includes("country")
      );

      console.log(country);
      if (country) {
        setSearch(country.long_name);
        break;
      }
    }
  };

  useEffect(() => {
    console.log("here");
    console.log("geolocation" in navigator);
    if ("geolocation" in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        console.log(coords);
        // @ts-ignore
        setLocation({ latitude, longitude });
      });
    }
  }, []);

  useEffect(() => {
    console.log(1, process.env.GOOGLE_API_KEY);
    if (location && !search) {
      console.log(2);
      fetchApiData(location);
    }
    console.log(location, search, location && !search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px]  items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      {iconPosition === "left" && (
        <Image
          src={imgSrc}
          alt="search icon"
          width={24}
          height={24}
          className="cursor-pointer "
        />
      )}
      <Input
        placeholder={placeholder}
        type="text"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        className="placeholder paragraph-regular text-dark400_light700 no-focus border-none  bg-transparent caret-gray-800 shadow-none outline-none"
      />
      {iconPosition === "right" && (
        <Image
          src={imgSrc}
          alt="search icon"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      )}
    </div>
  );
};

export default LocationSearchbar;
