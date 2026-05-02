import { MedusaService } from "@medusajs/framework/utils"
import SeoSetting from "./models/seo-setting"
import SiteSetting from "./models/site-setting"

class SeoModuleService extends MedusaService({ SeoSetting, SiteSetting }) {}

export default SeoModuleService