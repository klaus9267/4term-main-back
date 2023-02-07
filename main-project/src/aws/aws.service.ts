import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
  private readonly s3: AWS.S3;

  constructor() {
    AWS.config.update({
      region: process.env.AWS_BUCKET_REGION,
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    this.s3 = new AWS.S3();
  }

  async uploadChatFiles(files: Express.Multer.File[], chatRoomNo: number) {
    if (!files.length) {
      throw new BadRequestException(`업로드 할 파일이 존재하지 않습니다.`);
    }
    const uploadFileList: object[] = files.map((file) => {
      const key = `chat/${chatRoomNo}/${Date.now()}_${file.originalname}`;

      return {
        Bucket: process.env.AWS_BUCKET_NAME,
        ACL: 'public-read',
        Key: key,
        Body: file.buffer,
      };
    });

    uploadFileList.map(async (uploadFile: any) => {
      await this.s3
        .upload(uploadFile, (err, data) => {
          if (err) {
            throw new InternalServerErrorException(
              '파일 업로드에 실패하였습니다.',
            );
          }
        })
        .promise();
    });

    const fileUrlList: string[] = uploadFileList.map((file: any) => {
      return process.env.AWS_BUCKET_LINK + file.Key;
    });

    return fileUrlList;
  }

  async uploadImages(
    files: Express.Multer.File[],
    module: string,
  ): Promise<string[]> {
    if (!files.length) {
      throw new BadRequestException(`업로드 할 파일이 존재하지 않습니다.`);
    }
    const uploadFileList: object[] = files.map((file) => {
      const key = `${module}/${Date.now()}_${file.originalname}`;

      return {
        Bucket: process.env.AWS_BUCKET_NAME,
        ACL: 'public-read',
        Key: key,
        Body: file.buffer,
      };
    });

    uploadFileList.map((uploadFile: any) => {
      this.s3
        .upload(uploadFile, (err, data) => {
          if (err) {
            throw new InternalServerErrorException(
              '파일 업로드에 실패하였습니다.',
            );
          }
        })
        .promise();
    });

    const fileUrlList: string[] = uploadFileList.map((file: any) => {
      return process.env.AWS_BUCKET_LINK + file.Key;
    });

    return fileUrlList;
  }

  async deleteFiles(imagesUrls: string[]): Promise<void> {
    const keys = imagesUrls.map((image: string) => {
      let url = image.split('.com/');

      return { Key: url[1] };
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: keys,
        Quiet: false,
      },
    };

    await this.s3
      .deleteObjects(params, function (err, data) {
        if (err) {
          throw new InternalServerErrorException('파일 삭제 실패');
        }
      })
      .promise();
  }

  async uploadProfileImage(
    userNo: number,
    image: Express.Multer.File,
  ): Promise<string> {
    const key = `user-profile/${userNo}/${Date.now()}_${
      image.originalname
    }`.replace(/ /g, '');

    return await this.uploadFile(image, key);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const file = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileUrl.replace(process.env.AWS_BUCKET_LINK, ''),
    };

    await this.s3
      .deleteObject(file, (error) => {
        if (error) {
          throw new InternalServerErrorException('파일 삭제에 실패하였습니다.');
        }
      })
      .promise();
  }

  async uploadCertificate(
    userNo: number,
    file: Express.Multer.File,
  ): Promise<string> {
    const key = `user-certificate/${userNo}/${Date.now()}_${
      file.originalname
    }`.replace(/ /g, '');

    return await this.uploadFile(file, key);
  }

  private async uploadFile(
    file: Express.Multer.File,
    key: string,
  ): Promise<string> {
    const fileDetail = {
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL: 'public-read',
      Key: key,
      Body: file.buffer,
    };

    await this.s3
      .upload(fileDetail, (error) => {
        if (error) {
          throw new InternalServerErrorException(
            '파일 업로드에 실패하였습니다.',
          );
        }
      })
      .promise();

    return process.env.AWS_BUCKET_LINK + key;
  }
}
