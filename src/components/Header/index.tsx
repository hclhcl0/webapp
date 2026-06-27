import React from 'react';
import Link from 'next/link';
import { Search, LogIn } from 'lucide-react';
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { HeaderClient } from './HeaderClient';
import styles from './Header.module.css';

export const Header = async () => {
  let menuItems: any[] = [];
  let menuPosition = 'right';
  let logoConfig = {
    height: 52, position: 'left', showSiteName: true,
    line1: 'TRUNG TÂM KIỂM SOÁT BỆNH TẬT', line2: 'THÀNH PHỐ ĐÀ NẴNG',
    tagline: '', bannerImageUrl: '', mobileLogoUrl: '',
    mobileHeight: 52, mobileShowSiteName: false, hoverEffect: 'scale-tilt',
  };
  let searchConfig = { position: 'hotline', style: 'inline', width: 250 };
  let fb: any, tw: any, yt: any, ig: any;
  let phone = '0909 408 895';
  let actionLink = '#';
  let hotlinePosition = 'below-nav';
  let logoUrl = '/logo.png';
  let siteName = 'CDC Đà Nẵng';

  try {
    const payload = await getPayload({ config: configPromise });
    const s = await payload.findGlobal({ slug: 'site-settings', depth: 2 }) as any;
    const headerData = s?.header || {};
    const menuData = s?.menu || {};
    menuItems = menuData?.menuItems || [];
    menuPosition = menuData?.menuPosition || 'right';
    const lc = headerData.logoCustomization || {};
    logoConfig = {
      height: lc.logoHeight || 52,
      position: lc.logoPosition || 'left',
      showSiteName: lc.showSiteName !== false,
      line1: lc.siteNameLine1 || 'TRUNG TÂM KIỂM SOÁT BỆNH TẬT',
      line2: lc.siteNameLine2 || 'THÀNH PHỐ ĐÀ NẴNG',
      tagline: lc.siteTagline || '',
      bannerImageUrl: (lc.logoBannerImage as any)?.url || '',
      mobileLogoUrl: (lc.mobileLogo as any)?.url || '',
      mobileHeight: lc.mobileLogoHeight || 52,
      mobileShowSiteName: lc.mobileShowSiteName === true,
      hoverEffect: lc.logoHoverEffect || 'scale-tilt',
    };
    const sc = headerData.searchCustomization || {};
    searchConfig = { position: sc.position || 'hotline', style: sc.style || 'inline', width: sc.width || 250 };
    fb = headerData.socialLinks?.facebook;
    tw = headerData.socialLinks?.twitter;
    yt = headerData.socialLinks?.youtube;
    ig = headerData.socialLinks?.instagram;
    phone = headerData.hotline?.phone || '0909 408 895';
    actionLink = headerData.hotline?.actionLink || '#';
    hotlinePosition = headerData.hotline?.position || 'below-nav';
    logoUrl = (headerData.logo as any)?.url || '/logo.png';
    siteName = headerData.siteName || 'CDC Đà Nẵng';
  } catch (e) {
    console.error('Header: error fetching global header data:', e);
  }

  return (
    <HeaderClient
      menuItems={menuItems}
      menuPosition={menuPosition}
      logoUrl={logoUrl}
      logoConfig={logoConfig}
      searchConfig={searchConfig}
      hotlinePosition={hotlinePosition}
      siteName={siteName}
      phone={phone}
      actionLink={actionLink}
      socials={{ fb, tw, yt, ig }}
    />
  );
};
