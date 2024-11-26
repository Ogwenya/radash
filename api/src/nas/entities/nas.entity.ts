import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum NAS_TYPES {
  ASYNC = 'Async',
  SYNC = 'Sync',
  ISDN_SYNC = 'ISDN Sync',
  ISDN_ASYNC_V120 = 'ISDN Async V.120',
  ISDN_ASYNC_V110 = 'ISDN Async V.110',
  VIRTUAL = 'Virtual',
  PIAFS = 'PIAFS',
  HDLC_CLEAR = 'HDLC Clear',
  CHANNEL = 'Channel',
  X25 = 'X.25',
  X75 = 'X.75',
  G3_FAX = 'G.3 Fax',
  SDSL = 'SDSL - Symmetric DSL',
  ADSL_CAP = 'ADSL-CAP',
  ADSL_DMT = 'ADSL-DMT',
  IDSL = 'IDSL',
  ETHERNET = 'Ethernet',
  XDSL = 'xDSL',
  CABLE = 'Cable',
  WIRELESS_OTHER = 'Wireless - Other',
  WIRELESS_IEEE_80211 = 'Wireless - IEEE 802.11',
  TOKEN_RING = 'Token-Ring',
  FDDI = 'FDDI',
  WIRELESS_CDMA2000 = 'Wireless - CDMA2000',
  WIRELESS_UMTS = 'Wireless - UMTS',
  WIRELESS_1X_EV = 'Wireless - 1X-EV',
  IAPP = 'IAPP',
  FTTP = 'FTTP',
  WIRELESS_IEEE_80216 = 'Wireless - IEEE 802.16',
  WIRELESS_IEEE_80220 = 'Wireless - IEEE 802.20',
  WIRELESS_IEEE_80222 = 'Wireless - IEEE 802.22',
  PPPoA = 'PPPoA - PPP over ATM',
  PPPoEoA = 'PPPoEoA - PPP over Ethernet over ATM',
  PPPoEoE = 'PPPoEoE - PPP over Ethernet over Ethernet',
  PPPoEoVLAN = 'PPPoEoVLAN - PPP over Ethernet over VLAN',
  PPPoEoQinQ = 'PPPoEoQinQ - PPP over Ethernet over IEEE 802.1QinQ',
  XPON = 'xPON - Passive Optical Network',
  WIRELESS_XGP = 'Wireless - XGP',
  WIMAX_PRE_RELEASE_8 = 'WiMAX Pre-Release 8 IWK Function',
  WIMAX_WIFI_IWK = 'WIMAX-WIFI-IWK: WiMAX WIFI Interworking',
  WIMAX_SFF = 'WIMAX-SFF: Signaling Forwarding Function for LTE/3GPP2',
  WIMAX_HA_LMA = 'WIMAX-HA-LMA: WiMAX HA and or LMA function',
  WIMAX_DHCP = 'WIMAX-DHCP: WIMAX DCHP service',
  WIMAX_LBS = 'WiMAX location based service',
  WIMAX_WVS = 'WiMAX voice service',
  OTHER = 'other',
}

@Entity({ name: 'nas' })
export class Nas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  nasname: string;

  @Column({ type: 'text' })
  shortname: string;

  @Column({ default: 'other' })
  type: string;

  @Column({ type: 'int', nullable: true })
  ports?: number;

  @Column({ default: 'secret' })
  secret: string;

  @Column({ type: 'text', nullable: true })
  server: string;

  @Column({ type: 'text', nullable: true })
  community: string;

  @Column({ nullable: true, default: 'PPPoE' })
  description: string;
}
