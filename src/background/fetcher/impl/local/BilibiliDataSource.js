import TimeUtil from '../../../../common/util/TimeUtil';
import { DataItem, RetweetedInfo } from '../../../../common/DataItem';
import Settings from '../../../../common/Settings';

function normalizeWhitespaceCharacter(text, foldBlankChar = false) {
  // 确保换行只有\n，空格也全部是0x20
  let regex;
  if (foldBlankChar) {
    regex = /[\p{Z}\s]+/gu;
  } else {
    regex = /\p{Z}/gu;
  }
  return text.replaceAll(/\r\n/g, '\n').replaceAll(/\r/g, '\n').replaceAll(regex, ' ').trim();
}

function fetchAllText(dynamic, allowAllNodeTypes = false) {
  const desc = dynamic.modules.module_dynamic?.desc;
  if (!desc) {
    return '';
  }
  if (allowAllNodeTypes) {
    return normalizeWhitespaceCharacter(desc.text);
  }
  let allText = '';
  desc.rich_text_nodes.forEach((node) => {
    if (node.type === 'RICH_TEXT_NODE_TYPE_TEXT') {
      allText += node.text;
    } else if (node.type === 'RICH_TEXT_NODE_TYPE_WEB') {
      allText += node.orig_text;
    }
  });
  return normalizeWhitespaceCharacter(allText);
}

function normalizeURL(url, refererUrl) {
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  // noinspection HttpUrlsUsage
  if (!(url.startsWith('https://') || url.startsWith('http://'))) {
    if (url[0] === '/') {
      return new URL(refererUrl).origin + url;
    } else {
      return refererUrl.substring(0, refererUrl.lastIndexOf('/') + 1) + url;
    }
  }
  return url;
}

/**
 * 哔哩哔哩数据源。
 * <p>
 */
export class BilibiliDataSource {
  static async processData(rawDataText, sourceId) {
    const dynamic = JSON.parse(rawDataText);
    // 是否显示转发内容
    if (dynamic.type === 'DYNAMIC_TYPE_FORWARD' && !Settings.dun.showRetweet) {
      return;
    }
    const time = new Date(parseInt(dynamic.modules.module_author.pub_ts) * 1000);
    let images = [];
    let dynamicUrl = `https://t.bilibili.com/${dynamic.id_str}`;
    let urlObj;
    let allText;
    let retweeted;
    switch (dynamic.type) {
      case 'DYNAMIC_TYPE_WORD':
      case 'DYNAMIC_TYPE_DRAW':
        allText = fetchAllText(dynamic);
        if (dynamic.type === 'DYNAMIC_TYPE_DRAW') {
          images = dynamic.modules.module_dynamic.major.draw.items.map((it) => ({ origin_url: it.src }));
        }
        break;
      case 'DYNAMIC_TYPE_AV': {
        const archive = dynamic.modules.module_dynamic.major.archive;
        allText = normalizeWhitespaceCharacter(archive.title + '\n' + archive.desc);
        images = [{ origin_url: archive.cover }];
        dynamicUrl = 'https://www.bilibili.com/video/' + archive.bvid;
        break;
      }
      case 'DYNAMIC_TYPE_ARTICLE':
        if (dynamic.modules.module_dynamic.major.type === 'MAJOR_TYPE_OPUS') {
          const opus = dynamic.modules.module_dynamic.major.opus;
          allText = normalizeWhitespaceCharacter(opus.title + '\n' + opus.summary.text);
          images = opus.pics.map((it) => ({ origin_url: it.url }));
          dynamicUrl = normalizeURL(opus.jump_url, dynamicUrl);
        } else {
          const article = dynamic.modules.module_dynamic.major.article;
          allText = normalizeWhitespaceCharacter(article.title + '\n' + article.desc);
          images = article.covers.map((it) => ({ origin_url: it }));
          dynamicUrl = normalizeURL(article.jump_url, dynamicUrl);
        }
        break;
      case 'DYNAMIC_TYPE_PGC': {
        const pgc = dynamic.modules.module_dynamic.major.pgc;
        allText = normalizeWhitespaceCharacter(pgc.title);
        images = [{ origin_url: pgc.cover }];
        dynamicUrl = normalizeURL(pgc.jump_url, dynamicUrl);
        break;
      }
      case 'DYNAMIC_TYPE_LIVE_RCMD': {
        const live_rcmd = JSON.parse(dynamic.modules.module_dynamic.major.live_rcmd.content);
        allText = normalizeWhitespaceCharacter(live_rcmd.live_play_info.title);
        images = [{ origin_url: live_rcmd.live_play_info.cover }];
        urlObj = new URL(normalizeURL(live_rcmd.live_play_info.link, dynamicUrl));
        urlObj.hash = '';
        urlObj.search = '';
        dynamicUrl = urlObj.toString();
        break;
      }
      case 'DYNAMIC_TYPE_LIVE': {
        const live = dynamic.modules.module_dynamic.major.live;
        allText = normalizeWhitespaceCharacter(live.title);
        images = [{ origin_url: live.cover }];
        urlObj = new URL(normalizeURL(live.jump_url, dynamicUrl));
        urlObj.hash = '';
        urlObj.search = '';
        dynamicUrl = urlObj.toString();
        break;
      }
      case 'DYNAMIC_TYPE_FORWARD': {
        allText = normalizeWhitespaceCharacter(dynamic.modules.module_dynamic.desc.text);
        const orig = await BilibiliDataSource.processData(JSON.stringify(dynamic.orig));
        retweeted = {
          author_name: dynamic.orig.modules.module_author.name,
          author_avatar: dynamic.orig.modules.module_author.face,
          text: orig.text,
        };

        if (orig.images && orig.images.length > 0) {
          retweeted.images = orig.images;
        }
        break;
      }
      default:
        return;
    }
    const builder = DataItem.builder(sourceId)
      .id(dynamic.id_str)
      .timeForSort(time.getTime())
      .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
      .imageList(images.map((it) => it.origin_url))
      .content(allText)
      .jumpUrl(dynamicUrl);
    if (retweeted) {
      builder.retweeted(new RetweetedInfo(retweeted.author_name, retweeted.text));
    }
    return builder.build();
  }
}
