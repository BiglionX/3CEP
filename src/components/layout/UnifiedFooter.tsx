'use client';

import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Shield,
  Zap,
  Users,
  Globe,
} from 'lucide-react';

export function UnifiedFooter() {
  const footerSections = [
    {
      title: '产品服务',
      items: [
        { name: '设备维修', href: '/diagnosis' },
        { name: '配件商城', href: '/parts-market' },
        { name: '智能估价', href: '/valuation' },
        { name: '维修网点', href: '/repair-shop' },
        { name: '企业服务', href: '/enterprise' },
        { name: '贸易服务', href: '/foreign-trade/company' },
        { name: '维修店主', href: '/repair-shop/dashboard' },
      ],
    },
    {
      title: '学习支持',
      items: [
        { name: '文档中心', href: '/documents' },
        { name: '维修教程', href: '/tutorials' },
        { name: '帮助中心', href: '/help' },
        { name: '常见问题', href: '/faq' },
        { name: '技术支?, href: '/diagnosis' },
      ],
    },
    {
      title: '关于我们',
      items: [
        { name: '公司简?, href: '/about' },
        { name: '联系我们', href: '/contact' },
        { name: '加入我们', href: '#' },
        { name: '媒体报道', href: '#' },
        { name: '网站地图', href: '/sitemap' },
      ],
    },
    {
      title: '法律政策',
      items: [
        { name: '服务条款', href: '/terms' },
        { name: '隐私政策', href: '/privacy' },
        { name: '使用协议', href: '#' },
        { name: '安全中心', href: '/security' },
        { name: '合规认证', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', href: '#' },
    { icon: Twitter, name: 'Twitter', href: '#' },
    { icon: Instagram, name: 'Instagram', href: '#' },
    { icon: Youtube, name: 'YouTube', href: '#' },
  ];

  const contactInfo = [
    { icon: Phone, text: '400-888-9999', subtext: '工作?9:00-18:00' },
    { icon: Mail, text: 'support@fixcycle.com', subtext: '24小时在线支持' },
    { icon: MapPin, text: '深圳市南山区科技?, subtext: '总部地址' },
  ];

  const certifications = [
    { icon: Shield, text: 'ISO 27001认证' },
    { icon: Zap, text: '高新技术企? },
    { icon: Users, text: 'AAA信用企业' },
    { icon: Globe, text: '全球化服务网? },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo和联系信?*/}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FC</span>
              </div>
              <span className="text-2xl font-bold">ProdCycleAI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-xs">
              专注3C设备循环经济，提供专业维修、配件供应和智能估价服务?            </p>

            {/* 联系方式 */}
            <div className="space-y-3 mb-6">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <Icon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">{contact.text}</p>
                      <p className="text-gray-400 text-sm">{contact.subtext}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 社交媒体 */}
            <div className="flex space-x-4">
              {socialLinks.map(social => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 导航链接 */}
          {footerSections.map(section => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map(item => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 认证和合作伙?*/}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6">
              {certifications.map((cert, index) => {
                const Icon = cert.icon;
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400 text-sm">{cert.text}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-gray-500 text-sm">
              合作伙伴: Apple授权服务?| 华为金牌合作伙伴 | 小米生态链企业
            </div>
          </div>
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} ProdCycleAI
                深圳市循环科技有限公司. 保留所有权?
              </p>
              <p className="text-gray-500 text-xs mt-1">
                粤ICP备XXXXXXXX�?| 粤公网安备XXXXXXXXXXXXX�?              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                服务条款
              </Link>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                隐私政策
              </Link>
              <Link
                href="/security"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                安全中心
              </Link>
              <Link
                href="/sitemap"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                网站地图
              </Link>
            </div>
          </div>

          {/* 备案信息 */}
          <div className="mt-4 pt-4 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-xs">
              本网站由深圳市循环科技有限公司运营，致力于推动3C设备循环经济发展
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
