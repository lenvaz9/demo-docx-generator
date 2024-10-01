// Generate a CV

import * as fs from "fs";
import {
  AlignmentType,
  Document,
  Header,
  ImageRun,
  Packer,
  Paragraph,
  Tab,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import * as dayjs from "dayjs";

// tslint:disable:no-shadowed-variable

interface ClinicCase {
  patientName: string;
  dob: string;
  scannedAt: string;
  clinicalConcern: string;
}

const MockCaseDetails: ClinicCase = {
  dob: new Date().toISOString(),
  patientName: "Hemanth Singh",
  scannedAt: new Date().toISOString(),
  clinicalConcern: "Some service detail text",
};
class RadiologyReportTemplate {
  // tslint:disable-next-line: typedef
  public create(caseDetails: ClinicCase): Document {
    const document = new Document({
      styles: {
        paragraphStyles: [
          {
            id: '1',
            paragraph: {
              spacing: { after: 300 },
            },
          },
        ],
      },
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: fs.readFileSync("./src/assets/logo.png"),
                      transformation: {
                        width: 180,
                        height: 60,
                      },
                    }),
                  ],
                }),
              ],
            }),
          },
          children: [
            this.createDocumentTitle(),
            this.createTodayDateText(),
            this.createPatientDetails(caseDetails),
            this.createBoldText(["Examination of the anatomical volume: "], 1),
            this.createBoldText(["Image findings: "]),
            this.createClinicalConcern(caseDetails),
            this.createBoldText(["Paranasal sinuses: "]),
            this.createBoldText(["Nasal cavity: "]),
            this.createBoldText(["Temporomandibular joints: "]),
            this.createBoldText(["Osseous structures: "]),
            this.createBoldText(["Dental findings: "]),
            ...[1, 2].map((_) => this.createBullet("")),
            this.createBoldText(["Radiographic impressions: "], 1),
            this.createBoldText(["Summary: "]),
            this.createRegularText([
              "Radiologist name and signature",
              "Diplomate Oral and maxillofacial Radiology",
            ]),
            this.createBoldText(["Pertinent Images: "], 1),
          ],
        },
      ],
    });

    return document;
  }

  public dateFormat(value: string, format?: string) {
    return dayjs(value).format(format || "MMMM DD,YYYY");
  }

  public createClinicalConcern(caseDetails: ClinicCase) {
    const clinicalConcernText = caseDetails.clinicalConcern;
    return new Paragraph({
      children: [
        new TextRun({
          text: "Clinical Concern: ",
          bold: true,
        }),
        new TextRun({
          text: clinicalConcernText,
        }),
      ],
    });
  }

  public createPatientDetails(caseDetails: ClinicCase) {
    const patientName = caseDetails.patientName || "";
    const dob = this.dateFormat(caseDetails.dob, "MM/DD/YYYY") || "";
    const scannedAt =
      this.dateFormat(caseDetails.scannedAt, "MM/DD/YYYY") || "";
    return new Paragraph({
      children: [
        new TextRun({
          text: "Patient Name:      ",
          break: 1,
        }),
        new TextRun({
          text: patientName,
        }),
        new TextRun({
          text: "Birth Date:           ",
          break: 1,
        }),
        new TextRun({
          text: dob,
        }),
        new TextRun({
          text: "Date Of Scan:      ",
          break: 1,
        }),
        new TextRun({
          text: scannedAt,
        }),
      ],
    });
  }

  public createDocumentTitle(): Paragraph {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Radiology Report", bold: true, color: "#808080" }),
      ],
    });
  }

  public createInstitutionHeader(
    institutionName: string,
    dateText: string
  ): Paragraph {
    return new Paragraph({
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
        },
      ],
      children: [
        new TextRun({
          text: institutionName,
          bold: true,
        }),
        new TextRun({
          children: [new Tab(), dateText],
          bold: true,
        }),
      ],
    });
  }

  public createTodayDateText() {
    return this.createRegularText([this.dateFormat(new Date().toISOString())]);
  }

  public createRegularText(texts: string[], breakNumber?: number): Paragraph {
    return new Paragraph({
      children: [
        ...texts.map(
          (t) =>
            new TextRun({
              text: t,
              break: breakNumber || 1,
            })
        ),
      ],
    });
  }
  public createBoldText(texts: string[], breakNumber?: number): Paragraph {
    return new Paragraph({
      children: [
        ...texts.map(
          (t) =>
            new TextRun({
              text: t,
              bold: true,
              break: breakNumber,
            })
        ),
      ],
    });
  }

  public createBullet(text: string): Paragraph {
    return new Paragraph({
      text: text,
      bullet: {
        level: 0,
      },
    });
  }
}

export async function generateRadiologyTemplate() {
  const radiologyReportTemplate = new RadiologyReportTemplate();

  const doc = radiologyReportTemplate.create(MockCaseDetails);

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
