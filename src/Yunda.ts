import axios from 'axios';
import { createHash } from 'crypto';
import * as json2xml from 'json2xml';
import * as xml2json from 'xml2json';

export class Yunda {
  constructor(
    public partnerid: string,
    public password: string,
    public version: string,
    public endpoint: string
  ) {}

  public async request(
    requestType: ERequestType,
    xmldata: string
  ): Promise<IResponse> {
    const data = Buffer.from(xmldata).toString('base64');
    const validation = createHash('md5')
      .update(data + this.partnerid + this.password)
      .digest('hex')
      .toLowerCase();
    const res = await axios.post(this.endpoint, null, {
      params: {
        partnerid: this.partnerid,
        request: requestType,
        validation,
        version: this.version,
        xmldata: data,
      },
    });
    const resData = xml2json.toJson(res.data, { object: true });
    return resData.responses.response;
  }

  public parseOrder2Xml(order: IOrder): string {
    return json2xml({
      orders: [{ order }],
    });
  }

  public createOrder(order: IOrder) {
    const data = this.parseOrder2Xml(order);
    return this.request(ERequestType.data, data);
  }
}

export enum ERequestType {
  data = 'data',
  cancel_order = 'cancel_order',
  accept_order = 'accept_order',
}

export enum EOrderType {
  common = 'common',
  support_value = 'support_value',
  cod = 'cod',
  df = 'df',
}

export interface IContact {
  name: string;
  company?: string;
  city?: string;
  address: string;
  postcode?: string;
  phone?: string;
  mobile?: string;
  branch?: string;
}

export interface IItem {
  item: {
    name?: string;
    number?: string;
    remark?: string;
  };
}

export interface IOrder {
  order_serial_no: string;
  khddh: string;
  nbckh?: string;
  order_type: EOrderType;
  sender: IContact;
  receiver: IContact;
  weight?: string;
  size?: string;
  value?: string;
  remark?: string;
  items?: IItem[];
}

export interface IResponse {
  order_serial_no: string;
  mail_no: string;
  pdf_info: string;
  status: string;
  msg: string;
}
